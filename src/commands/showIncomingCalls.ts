import * as vscode from 'vscode';
import { CallHierarchyTreeDataProvider } from '../providers/CallHierarchyTreeDataProvider';
import { SymbolResolver } from '../indexer/symbolResolver';
import { SymbolInformation } from '../models/types';
import { normalizePath } from '../utils/fileUtils';

export function registerShowIncomingCallsCommand(
  context: vscode.ExtensionContext,
  treeProvider: CallHierarchyTreeDataProvider,
  symbolResolver: SymbolResolver,
  treeView: vscode.TreeView<any>
): vscode.Disposable {
  return vscode.commands.registerCommand('php-call-hierarchy.showIncomingCalls', async (item?: any) => {
    let symbol: SymbolInformation | undefined;

    if (item && item.hierarchyNode && item.hierarchyNode.symbol) {
      symbol = item.hierarchyNode.symbol;
    } else {
      symbol = await findSymbolAtCursor(symbolResolver);
    }

    if (symbol) {
      treeProvider.setRootSymbol(symbol.id, 'incoming');

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

      vscode.window.setStatusBarMessage(`PHP Call Hierarchy: Incoming calls for ${symbol.name}`, 3000);
    } else {
      vscode.window.showWarningMessage('No PHP function or method found at active cursor position.');
    }
  });
}

export async function findSymbolAtCursor(symbolResolver: SymbolResolver): Promise<SymbolInformation | undefined> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'php') {
    return undefined;
  }

  const filePath = normalizePath(editor.document.uri.fsPath);
  const position = editor.selection.active;
  const line = position.line;
  const col = position.character;

  const matchingSymbols: SymbolInformation[] = [];
  const allSymbols = (symbolResolver as any).symbolsById as Map<string, SymbolInformation>;

  if (allSymbols) {
    for (const sym of allSymbols.values()) {
      if (normalizePath(sym.fileUri) === filePath) {
        if (
          (line > sym.range.startLine || (line === sym.range.startLine && col >= sym.range.startCol)) &&
          (line < sym.range.endLine || (line === sym.range.endLine && col <= sym.range.endCol))
        ) {
          matchingSymbols.push(sym);
        }
      }
    }
  }

  if (matchingSymbols.length === 0) {
    return undefined;
  }

  matchingSymbols.sort((a, b) => {
    const rangeA = (a.range.endLine - a.range.startLine) * 1000 + (a.range.endCol - a.range.startCol);
    const rangeB = (b.range.endLine - b.range.startLine) * 1000 + (b.range.endCol - b.range.startCol);
    return rangeA - rangeB;
  });

  return matchingSymbols[0];
}
