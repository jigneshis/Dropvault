// Mock storage utilities - replace with Supabase in production
export class StorageService {
  private static files: Map<string, any> = new Map();
  
  static async uploadFile(file: File, password?: string, expiresIn?: number): Promise<string> {
    return new Promise((resolve) => {
      const fileId = this.generateId();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (expiresIn || 24));
      
      // Simulate file upload
      setTimeout(() => {
        const fileData = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          password,
          expiresAt,
          downloads: 0,
          createdAt: new Date(),
        };
        
        this.files.set(fileId, fileData);
        resolve(fileId);
      }, 1000 + Math.random() * 2000);
    });
  }
  
  static async getFile(fileId: string): Promise<any | null> {
    const file = this.files.get(fileId);
    if (!file) return null;
    
    // Check if file has expired
    if (new Date() > file.expiresAt) {
      this.files.delete(fileId);
      return null;
    }
    
    return file;
  }
  
  static async deleteFile(fileId: string): Promise<boolean> {
    return this.files.delete(fileId);
  }
  
  static async incrementDownload(fileId: string): Promise<void> {
    const file = this.files.get(fileId);
    if (file) {
      file.downloads += 1;
      this.files.set(fileId, file);
    }
  }
  
  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}