import { supabase } from './supabase'
import type { SharedFile } from './supabase'
import { hashPassword, verifyPassword } from './crypto'

export class StorageService {
  private static readonly BUCKET_NAME = 'shared-files'

  static async uploadFile(
    file: File,
    password?: string,
    expiresInHours: number = 24,
    maxDownloads?: number
  ): Promise<{
    fileId: string
    fileName: string
    expiresAt: Date
    hasPassword: boolean
    maxDownloads?: number
  }> {
    // Generate unique file path
    const filePath = this.generateUniqueFileName(file.name)
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    
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
    const passwordHash = password ? await hashPassword(password) : null

    // Create database record
    const fileRecord: Omit<SharedFile, 'id' | 'created_at'> = {
      file_path: data.path,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      password_hash: passwordHash,
      expires_at: expiresAt.toISOString(),
      max_downloads: maxDownloads,
      current_downloads: 0,
      last_accessed: null,
      ip_address: null,
      user_agent: null
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

    return {
      fileId: dbData.id,
      fileName: file.name,
      expiresAt,
      hasPassword: !!password,
      maxDownloads
    }
  }

  static async getFile(fileId: string, password?: string): Promise<{
    file: SharedFile
    downloadUrl: string
  } | null> {
    const { data, error } = await supabase
      .from('shared_files')
      .select('*')
      .eq('id', fileId)
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
    if (data.password_hash) {
      if (!password) {
        throw new Error('Password required')
      }
      const isValid = await verifyPassword(password, data.password_hash)
      if (!isValid) {
        throw new Error('Invalid password')
      }
    }

    // Get download URL
    const { data: urlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(data.file_path)

    return {
      file: data,
      downloadUrl: urlData.publicUrl
    }
  }

  static async incrementDownload(fileId: string): Promise<void> {
    const { error } = await supabase
      .from('shared_files')
      .update({ 
        current_downloads: supabase.raw('current_downloads + 1'),
        last_accessed: new Date().toISOString()
      })
      .eq('id', fileId)

    if (error) {
      throw new Error(`Failed to increment download count: ${error.message}`)
    }
  }

  static async getStats(): Promise<{
    totalFiles: number
    totalDownloads: number
    filesToday: number
    avgFileSize: number
  }> {
    const { data, error } = await supabase
      .from('shared_files')
      .select('file_size, current_downloads, created_at')

    if (error) {
      throw new Error(`Failed to get stats: ${error.message}`)
    }

    const totalFiles = data.length
    const totalDownloads = data.reduce((sum, file) => sum + (file.current_downloads || 0), 0)
    const avgFileSize = data.length > 0 ? data.reduce((sum, file) => sum + file.file_size, 0) / data.length : 0
    
    // Count files uploaded today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const filesToday = data.filter(file => 
      file.created_at && new Date(file.created_at) >= today
    ).length

    return { totalFiles, totalDownloads, filesToday, avgFileSize }
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

  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    return `${timestamp}-${randomString}.${extension}`
  }
}