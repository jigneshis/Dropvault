import { supabase, STORAGE_BUCKET, SharedFile } from './supabase';
import { hashPassword, verifyPassword } from './crypto';

export class StorageService {
  static async uploadFile(
    file: File, 
    password?: string, 
    expiresIn: number = 24,
    maxDownloads?: number
  ): Promise<{
    fileId: string;
    fileName: string;
    expiresAt: Date;
    hasPassword: boolean;
    maxDownloads?: number;
  }> {
    try {
      // Generate unique file path
      const fileId = this.generateId();
      const fileExtension = file.name.split('.').pop();
      const filePath = `${fileId}${fileExtension ? '.' + fileExtension : ''}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresIn);

      // Hash password if provided
      const passwordHash = password ? await hashPassword(password) : undefined;

      // Get client info for analytics
      const userAgent = navigator.userAgent;
      
      // Insert file metadata into database
      const { error: dbError } = await supabase
        .from('shared_files')
        .insert({
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          password_hash: passwordHash,
          expires_at: expiresAt.toISOString(),
          max_downloads: maxDownloads,
          user_agent: userAgent
        });

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        fileId: filePath,
        fileName: file.name,
        expiresAt,
        hasPassword: !!password,
        maxDownloads
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  static async getFile(fileId: string, password?: string): Promise<{
    file: SharedFile;
    downloadUrl: string;
  } | null> {
    try {
      // Get file metadata from database
      const { data: fileData, error: dbError } = await supabase
        .from('shared_files')
        .select('*')
        .eq('file_path', fileId)
        .single();

      if (dbError || !fileData) {
        return null;
      }

      // Check if file has expired
      if (new Date() > new Date(fileData.expires_at)) {
        // Clean up expired file
        await this.deleteFile(fileId);
        return null;
      }

      // Check download limit
      if (fileData.max_downloads && fileData.current_downloads >= fileData.max_downloads) {
        return null;
      }

      // Verify password if required
      if (fileData.password_hash && password) {
        const isValidPassword = await verifyPassword(password, fileData.password_hash);
        if (!isValidPassword) {
          throw new Error('Invalid password');
        }
      } else if (fileData.password_hash && !password) {
        throw new Error('Password required');
      }

      // Generate signed URL for download
      const { data: urlData, error: urlError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(fileId, 3600); // 1 hour expiry

      if (urlError || !urlData) {
        throw new Error('Failed to generate download URL');
      }

      // Update last accessed time
      await supabase
        .from('shared_files')
        .update({ last_accessed: new Date().toISOString() })
        .eq('file_path', fileId);

      return {
        file: fileData,
        downloadUrl: urlData.signedUrl
      };
    } catch (error) {
      console.error('Get file error:', error);
      throw error;
    }
  }

  static async deleteFile(fileId: string): Promise<boolean> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([fileId]);

      // Delete from database
      const { error: dbError } = await supabase
        .from('shared_files')
        .delete()
        .eq('file_path', fileId);

      return !storageError && !dbError;
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  static async incrementDownload(fileId: string): Promise<void> {
    try {
      await supabase
        .from('shared_files')
        .update({ 
          current_downloads: supabase.raw('current_downloads + 1')
        })
        .eq('file_path', fileId);
    } catch (error) {
      console.error('Increment download error:', error);
    }
  }

  static async getStats(): Promise<{
    totalFiles: number;
    totalDownloads: number;
    filesToday: number;
    avgFileSize: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_file_stats');

      if (error || !data || data.length === 0) {
        return { totalFiles: 0, totalDownloads: 0, filesToday: 0, avgFileSize: 0 };
      }

      const stats = data[0];
      return {
        totalFiles: stats.total_files || 0,
        totalDownloads: stats.total_downloads || 0,
        filesToday: stats.files_today || 0,
        avgFileSize: stats.avg_file_size || 0
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return { totalFiles: 0, totalDownloads: 0, filesToday: 0, avgFileSize: 0 };
    }
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}