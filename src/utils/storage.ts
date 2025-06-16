import { supabase } from './supabase'

export class StorageService {
  private static readonly BUCKET_NAME = 'shared-files'

  static async uploadFile(file: File, filePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    return data.path
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