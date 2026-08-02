export interface IStorageService {
  upload(file: File, bucket: string): Promise<string>;
  delete(fileUrl: string, bucket: string): Promise<void>;
}
