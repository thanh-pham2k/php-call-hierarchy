import { FileIndexData } from '../models/types';

export class CacheManager {
  private cache: Map<string, FileIndexData> = new Map();

  public get(fileUri: string, mtime: number): FileIndexData | null {
    const cached = this.cache.get(fileUri);
    if (cached && cached.mtime === mtime) {
      return cached;
    }
    return null;
  }

  public set(fileUri: string, data: FileIndexData): void {
    this.cache.set(fileUri, data);
  }

  public delete(fileUri: string): void {
    this.cache.delete(fileUri);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getAll(): FileIndexData[] {
    return Array.from(this.cache.values());
  }

  public get size(): number {
    return this.cache.size;
  }
}
