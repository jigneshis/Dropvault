import { supabase } from './supabase'
import type { SharedFile } from './supabase'
import { hashPassword, verifyPassword } from './crypto'

export class StorageService {
  private static readonly BUCKET_NAME = 'shared-files'

  static async uploadFile(
    file: File, 
    options: {
      password?: string
      expiresAt: Date
      maxDownloads?: number
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<{ fileRecord: SharedFile; filePath: string }> {
    // Generate unique file path
    const filePath = this.generateUniqueFileName(file.name)
    
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Hash password if provided
    const passwordHash = options.password ? await hashPassword(options.password) : null

    // Create database record
    const fileRecord: Omit<SharedFile, 'id' | 'created_at'> = {
      file_path: data.path,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      password_hash: passwordHash,
      expires_at: options.expiresAt.toISOString(),
      max_downloads: options.maxDownloads,
      current_downloads: 0,
      last_accessed: null,
      ip_address: options.ipAddress,
      user_agent: options.userAgent
    }

    const { data: dbData, error: dbError } = await supabase
      .from('shared_files')
      .insert(fileRecord)
      .select()
      .single()

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await this.deleteFile(data.path)
      throw new Error(`Database error: ${dbError.message}`)
    }

    return { fileRecord: dbData, filePath: data.path }
  }

  static async getFile(filePath: string, password?: string): Promise<SharedFile | null> {
    const { data, error } = await supabase
      .from('shared_files')
      .select('*')
      .eq('file_path', filePath)
      .single()

    if (error || !data) {
      return null
    }

    // Check if file is expired
    if (new Date(data.expires_at) <= new Date()) {
      return null
    }

    // Check if max downloads reached
    if (data.max_downloads && data.current_downloads >= data.max_downloads) {
      return null
    }

    // Verify password if required
    if (data.password_hash && password) {
      const isValid = await verifyPassword(password, data.password_hash)
      if (!isValid) {
        return null
      }
    } else if (data.password_hash && !password) {
      return null
    }

    return data
  }

  static async incrementDownload(filePath: string): Promise<void> {
    const { error } = await supabase
      .from('shared_files')
      .update({ 
        current_downloads: supabase.raw('current_downloads + 1'),
        last_accessed: new Date().toISOString()
      })
      .eq('file_path', filePath)

    if (error) {
      throw new Error(`Failed to increment download count: ${error.message}`)
    }
  }

  static async getStats(): Promise<{
    totalFiles: number
    totalDownloads: number
    totalSize: number
  }> {
    const { data, error } = await supabase
      .from('shared_files')
      .select('file_size, current_downloads')

    if (error) {
      throw new Error(`Failed to get stats: ${error.message}`)
    }

    const totalFiles = data.length
    const totalDownloads = data.reduce((sum, file) => sum + (file.current_downloads || 0), 0)
    const totalSize = data.reduce((sum, file) => sum + file.file_size, 0)

    return { totalFiles, totalDownloads, totalSize }
  }

  static async downloadFile(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .download(filePath)

    if (error) {
      throw new Error(`Download failed: ${error.message}`)
    }

    return data
  }

  static async deleteFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([filePath])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  }

  static async getFileUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    return `${timestamp}-${randomString}.${extension}`
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}