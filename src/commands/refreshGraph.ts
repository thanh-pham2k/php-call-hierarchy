import * as vscode from 'vscode';
import { WorkspaceIndexer } from '../indexer/workspaceIndexer';
import { CallHierarchyTreeDataProvider } from '../providers/CallHierarchyTreeDataProvider';
import { Logger } from '../utils/logger';

export function registerRefreshGraphCommand(
  context: vscode.ExtensionContext,
  indexer: WorkspaceIndexer,
  treeProvider: CallHierarchyTreeDataProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('php-call-hierarchy.refresh', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('No workspace folder open to index.');
      return;
    }

    const config = vscode.workspace.getConfiguration('phpCallHierarchy');
    const excludePatterns: string[] = config.get('excludePatterns') || [];

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'PHP Call Hierarchy: Re-indexing workspace...',
        cancellable: true
      },
      async (progress, token) => {
        indexer.clear();
        let total = 0;
        let lastReported = 0;

        await indexer.indexWorkspace(
          workspaceFolders[0].uri.fsPath,
          { excludePatterns },
          token,
          (indexed, count) => {
            total = count;
            const pct = Math.round((indexed / count) * 100);
            if (pct - lastReported >= 5) {
              lastReported = pct;
              progress.report({ message: `${indexed}/${count} files (${pct}%)` });
            }
          }
        );

        treeProvider.refresh();
        vscode.window.showInformationMessage(`PHP Call Hierarchy re-indexed ${total} PHP files.`);
      }
    );
  });
}
