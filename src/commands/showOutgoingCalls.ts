import * as vscode from 'vscode';
import { CallHierarchyTreeDataProvider } from '../providers/CallHierarchyTreeDataProvider';
import { SymbolResolver } from '../indexer/symbolResolver';
import { SymbolInformation } from '../models/types';
import { findSymbolAtCursor } from './showIncomingCalls';

export function registerShowOutgoingCallsCommand(
  context: vscode.ExtensionContext,
  treeProvider: CallHierarchyTreeDataProvider,
  symbolResolver: SymbolResolver,
  treeView: vscode.TreeView<any>
): vscode.Disposable {
  return vscode.commands.registerCommand('php-call-hierarchy.showOutgoingCalls', async (item?: any) => {
    let symbol: SymbolInformation | undefined;

    if (item && item.hierarchyNode && item.hierarchyNode.symbol) {
      symbol = item.hierarchyNode.symbol;
    } else {
      symbol = await findSymbolAtCursor(symbolResolver);
    }

    if (symbol) {
      treeProvider.setRootSymbol(symbol.id, 'outgoing');

      // Automatically focus and show the Call Hierarchy view in sidebar
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

      vscode.window.setStatusBarMessage(`PHP Call Hierarchy: Outgoing calls for ${symbol.name}`, 3000);
    } else {
      vscode.window.showWarningMessage('No PHP function or method found at active cursor position.');
    }
  });
}
