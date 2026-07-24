import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import { CacheManager } from '../cache/cacheManager';
import { SymbolResolver } from './symbolResolver';
import { CallGraph } from '../graph/callGraph';
import { WorkerPool } from '../workers/workerPool';
import { FileIndexData } from '../models/types';
import { Logger } from '../utils/logger';
import { normalizePath } from '../utils/fileUtils';

export interface IndexerOptions {
  excludePatterns: string[];
  maxConcurrency?: number;
}

export class WorkspaceIndexer {
  private cacheManager: CacheManager;
  private symbolResolver: SymbolResolver;
  private callGraph: CallGraph;
  private workerPool: WorkerPool;
  private isIndexing = false;

  constructor(
    symbolResolver: SymbolResolver,
    callGraph: CallGraph,
    cacheManager?: CacheManager,
    workerPool?: WorkerPool
  ) {
    this.symbolResolver = symbolResolver;
    this.callGraph = callGraph;
    this.cacheManager = cacheManager || new CacheManager();
    this.workerPool = workerPool || new WorkerPool();
  }

  public async indexWorkspace(
    workspacePath: string,
    options: IndexerOptions,
    cancellationToken?: { isCancellationRequested: boolean },
    onProgress?: (indexed: number, total: number) => void
  ): Promise<{ indexedFiles: number; totalFiles: number; durationMs: number }> {
    if (this.isIndexing) {
      Logger.warn('Indexing is already in progress');
    }
    this.isIndexing = true;
    const startTime = Date.now();

    try {
      const normPath = normalizePath(workspacePath);
      Logger.info(`Scanning directory for PHP files: ${normPath}`);

      const ignorePatterns = options.excludePatterns || [
        '**/vendor/**',
        '**/node_modules/**',
        '**/storage/**',
        '**/cache/**',
        '**/build/**',
        '**/dist/**'
      ];

      const phpFiles = await fg('**/*.php', {
        cwd: normPath,
        absolute: true,
        ignore: ignorePatterns,
        onlyFiles: true,
        suppressErrors: true
      });

      const totalFiles = phpFiles.length;
      Logger.info(`Found ${totalFiles} PHP files to index (excluding configured patterns).`);

      let indexedCount = 0;
      const batchSize = 10;

      for (let i = 0; i < totalFiles; i += batchSize) {
        if (cancellationToken?.isCancellationRequested) {
          Logger.info('Workspace indexing cancelled by user');
          break;
        }

        const batch = phpFiles.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (filePath) => {
            const normalizedFileUri = normalizePath(filePath);
            await this.indexSingleFile(normalizedFileUri);
            indexedCount++;
          })
        );

        if (onProgress) {
          onProgress(indexedCount, totalFiles);
        }
      }

      const durationMs = Date.now() - startTime;
      Logger.info(`Workspace indexing completed in ${durationMs}ms. Indexed ${indexedCount}/${totalFiles} files.`);
      return { indexedFiles: indexedCount, totalFiles, durationMs };
    } finally {
      this.isIndexing = false;
    }
  }

  public async indexSingleFile(filePath: string): Promise<FileIndexData | null> {
    const normalizedFileUri = normalizePath(filePath);

    try {
      if (!fs.existsSync(normalizedFileUri)) {
        this.removeSingleFile(normalizedFileUri);
        return null;
      }

      const stats = await fs.promises.stat(normalizedFileUri);
      const mtime = stats.mtimeMs;

      // Check Cache
      const cached = this.cacheManager.get(normalizedFileUri, mtime);
      if (cached) {
        this.applyIndexData(cached);
        return cached;
      }

      // Remove existing index for this file before re-indexing
      this.removeSingleFile(normalizedFileUri);

      // Read file content
      const code = await fs.promises.readFile(normalizedFileUri, 'utf-8');

      // Parse AST via WorkerPool
      const fileData = await this.workerPool.parseFile(normalizedFileUri, code, mtime);

      // Save to cache and apply to Graph
      this.cacheManager.set(normalizedFileUri, fileData);
      this.applyIndexData(fileData);

      return fileData;
    } catch (err: any) {
      Logger.error(`Failed to index file: ${normalizedFileUri}`, err);
      return null;
    }
  }

  public removeSingleFile(filePath: string): void {
    const normalizedFileUri = normalizePath(filePath);
    const cached = this.cacheManager.get(normalizedFileUri, -1) || this.cacheManager.getAll().find(d => d.fileUri === normalizedFileUri);

    if (cached) {
      for (const cls of cached.classes) {
        this.symbolResolver.removeClass(cls.fqcn);
      }
      for (const sym of cached.symbols) {
        this.symbolResolver.removeSymbol(sym.id);
      }
    }

    this.callGraph.removeFile(normalizedFileUri);
    this.cacheManager.delete(normalizedFileUri);
  }

  private applyIndexData(data: FileIndexData): void {
    for (const cls of data.classes) {
      this.symbolResolver.addClass(cls);
    }
    for (const sym of data.symbols) {
      this.symbolResolver.addSymbol(sym);
    }
    for (const site of data.callSites) {
      this.callGraph.addCallSite(site);
    }
  }

  public clear(): void {
    this.cacheManager.clear();
    this.symbolResolver.clear();
    this.callGraph.clear();
  }

  public dispose(): void {
    this.workerPool.dispose();
  }
}
