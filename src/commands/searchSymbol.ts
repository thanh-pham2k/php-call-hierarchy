import * as vscode from 'vscode';
import { SymbolResolver } from '../indexer/symbolResolver';
import { CallHierarchyTreeDataProvider } from '../providers/CallHierarchyTreeDataProvider';
import { SymbolInformation } from '../models/types';
import { relativePath } from '../utils/fileUtils';

export function registerSearchSymbolCommand(
  context: vscode.ExtensionContext,
  symbolResolver: SymbolResolver,
  treeProvider: CallHierarchyTreeDataProvider,
  treeView: vscode.TreeView<any>
): vscode.Disposable {
  return vscode.commands.registerCommand('php-call-hierarchy.search', async () => {
    const allSymbolsMap = (symbolResolver as any).symbolsById as Map<string, SymbolInformation>;
    if (!allSymbolsMap || allSymbolsMap.size === 0) {
      vscode.window.showWarningMessage('No indexed PHP symbols found. Try refreshing the workspace index.');
      return;
    }

    const items: (vscode.QuickPickItem & { symbolId: string })[] = [];
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';

    for (const symbol of allSymbolsMap.values()) {
      if (symbol.kind === 'method' || symbol.kind === 'staticMethod' || symbol.kind === 'function') {
        const relFile = workspacePath ? relativePath(workspacePath, symbol.fileUri) : symbol.fileUri;
        const line = symbol.range.startLine + 1;

        items.push({
          label: `$(symbol-method) ${symbol.name}`,
          description: symbol.containerName ? `${symbol.containerName} • ${relFile}:${line}` : `${relFile}:${line}`,
          detail: symbol.fqcn || symbol.id,
          symbolId: symbol.id
        });
      }
    }

    if (items.length === 0) {
      vscode.window.showWarningMessage('No functions or methods found in index.');
      return;
    }

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Search PHP function or method for Call Hierarchy...',
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (selected) {
      treeProvider.setRootSymbol(selected.symbolId, 'incoming');

      try {
        await vscode.commands.executeCommand('phpCallHierarchyView.focus');
      } catch {
        try {
          await vscode.commands.executeCommand('phpCallHierarchyExplorerView.focus');
        } catch {}
      }

      setTimeout(async () => {
        const children = await treeProvider.getChildren();
        if (children && children.length > 0) {
          treeView.reveal(children[0], { select: true, focus: true, expand: true }).then(
            () => {},
            () => {}
          );
        }
      }, 50);
    }
  });
}
