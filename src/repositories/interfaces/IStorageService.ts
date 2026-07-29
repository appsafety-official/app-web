export interface IStorageService {
  upload(file: File, path: string): Promise<string>;
  getUrl(path: string): Promise<string>;
  delete(path: string): Promise<void>;
}
