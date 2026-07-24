import * as vscode from 'vscode';
import { SymbolResolver } from './indexer/symbolResolver';
import { CallGraph } from './graph/callGraph';
import { CacheManager } from './cache/cacheManager';
import { WorkerPool } from './workers/workerPool';
import { WorkspaceIndexer } from './indexer/workspaceIndexer';
import { CallHierarchyTreeDataProvider } from './providers/CallHierarchyTreeDataProvider';
import { registerShowIncomingCallsCommand } from './commands/showIncomingCalls';
import { registerShowOutgoingCallsCommand } from './commands/showOutgoingCalls';
import { registerRefreshGraphCommand } from './commands/refreshGraph';
import { registerSearchSymbolCommand } from './commands/searchSymbol';
import { Logger } from './utils/logger';
import { debounce } from './utils/debounce';
import { normalizePath } from './utils/fileUtils';

export async function activate(context: vscode.ExtensionContext) {
  Logger.initialize();
  Logger.info('Activating PHP Call Hierarchy extension...');

  const symbolResolver = new SymbolResolver();
  const callGraph = new CallGraph(symbolResolver);
  const cacheManager = new CacheManager();
  const workerPool = new WorkerPool();

  const indexer = new WorkspaceIndexer(symbolResolver, callGraph, cacheManager, workerPool);

  const getConfig = () => {
    const config = vscode.workspace.getConfiguration('phpCallHierarchy');
    return {
      maxDepth: config.get<number>('maxDepth') || 5,
      maxResults: config.get<number>('maxResults') || 50,
      excludePatterns: config.get<string[]>('excludePatterns') || [
        '**/vendor/**',
        '**/node_modules/**',
        '**/storage/**',
        '**/cache/**',
        '**/build/**',
        '**/dist/**'
      ],
      autoIndexOnStart: config.get<boolean>('autoIndexOnStart') ?? true
    };
  };

  const treeProvider = new CallHierarchyTreeDataProvider(callGraph, symbolResolver, getConfig);

  // Register Tree Views
  const treeView = vscode.window.createTreeView('phpCallHierarchyView', {
    treeDataProvider: treeProvider,
    showCollapseAll: true
  });

  const explorerTreeView = vscode.window.createTreeView('phpCallHierarchyExplorerView', {
    treeDataProvider: treeProvider,
    showCollapseAll: true
  });

  context.subscriptions.push(treeView, explorerTreeView);

  // Register Commands
  context.subscriptions.push(
    registerShowIncomingCallsCommand(context, treeProvider, symbolResolver, treeView),
    registerShowOutgoingCallsCommand(context, treeProvider, symbolResolver, treeView),
    registerRefreshGraphCommand(context, indexer, treeProvider),
    registerSearchSymbolCommand(context, symbolResolver, treeProvider, treeView)
  );

  // Debounced file save listener
  const debouncedIndexSingleFile = debounce((fileUri: string) => {
    indexer.indexSingleFile(fileUri).then(() => {
      treeProvider.refresh();
    });
  }, 300);

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.languageId === 'php' || doc.fileName.endsWith('.php')) {
        debouncedIndexSingleFile(normalizePath(doc.fileName));
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidDeleteFiles((e) => {
      for (const fileUri of e.files) {
        if (fileUri.fsPath.endsWith('.php')) {
          indexer.removeSingleFile(normalizePath(fileUri.fsPath));
        }
      }
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidRenameFiles((e) => {
      for (const file of e.files) {
        if (file.oldUri.fsPath.endsWith('.php')) {
          indexer.removeSingleFile(normalizePath(file.oldUri.fsPath));
        }
        if (file.newUri.fsPath.endsWith('.php')) {
          debouncedIndexSingleFile(normalizePath(file.newUri.fsPath));
        }
      }
    })
  );

  // Auto Index on Activation
  const cfg = getConfig();
  if (cfg.autoIndexOnStart && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    Logger.info(`Auto-indexing workspace on activation: ${rootPath}`);

    // Run indexing asynchronously to not block extension activation
    setTimeout(() => {
      indexer.indexWorkspace(rootPath, { excludePatterns: cfg.excludePatterns }).then(
        (res) => {
          Logger.info(`Auto-indexing finished in ${res.durationMs}ms (${res.indexedFiles}/${res.totalFiles} files)`);
          treeProvider.refresh();
        },
        (err) => {
          Logger.error('Auto-indexing error', err);
        }
      );
    }, 100);
  }

  // Cleanup disposable
  context.subscriptions.push({
    dispose: () => {
      indexer.dispose();
    }
  });

  Logger.info('PHP Call Hierarchy extension activated successfully.');
}

export function deactivate() {
  Logger.info('Deactivating PHP Call Hierarchy extension.');
}
