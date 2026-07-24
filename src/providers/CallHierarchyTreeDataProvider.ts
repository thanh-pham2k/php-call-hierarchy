import * as vscode from 'vscode';
import * as path from 'path';
import { CallGraph } from '../graph/callGraph';
import { SymbolResolver } from '../indexer/symbolResolver';
import { CallHierarchyNode, SymbolInformation } from '../models/types';
import { relativePath } from '../utils/fileUtils';

export class CallHierarchyItemNode extends vscode.TreeItem {
  constructor(
    public readonly hierarchyNode: CallHierarchyNode,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    const symbol = hierarchyNode.symbol;
    const name = symbol.name;
    const container = symbol.containerName ? `${symbol.containerName}` : '';
    const label = symbol.kind === 'function' ? `${name}()` : `${name}()`;

    super(label, collapsibleState);

    const relFile = vscode.workspace.workspaceFolders?.[0]
      ? relativePath(vscode.workspace.workspaceFolders[0].uri.fsPath, symbol.fileUri)
      : path.basename(symbol.fileUri);

    const line = symbol.range.startLine + 1;

    let desc = container ? `${container} • ${relFile}:${line}` : `${relFile}:${line}`;
    if (hierarchyNode.childCount !== undefined && hierarchyNode.childCount > 0) {
      desc += ` (${hierarchyNode.childCount})`;
    }
    if (hierarchyNode.callSiteCount !== undefined && hierarchyNode.callSiteCount > 1) {
      desc += ` [${hierarchyNode.callSiteCount} calls]`;
    }
    if (hierarchyNode.isCycle) {
      desc += ' [recursive]';
    }

    this.description = desc;
    this.tooltip = `${symbol.fqcn || symbol.id}\nFile: ${symbol.fileUri}:${line}\nKind: ${symbol.kind}`;

    if (hierarchyNode.isCycle) {
      this.iconPath = new vscode.ThemeIcon('sync-ignored');
    } else if (hierarchyNode.direction === 'incoming') {
      this.iconPath = new vscode.ThemeIcon('call-incoming');
    } else {
      this.iconPath = new vscode.ThemeIcon('call-outgoing');
    }

    // Command to open file on click
    this.command = {
      command: 'vscode.open',
      title: 'Open File',
      arguments: [
        vscode.Uri.file(symbol.fileUri),
        {
          selection: new vscode.Range(
            symbol.selectionRange.startLine,
            symbol.selectionRange.startCol,
            symbol.selectionRange.endLine,
            symbol.selectionRange.endCol
          ),
          preserveFocus: true
        }
      ]
    };

    this.contextValue = 'callHierarchyNode';
  }
}

export class CallHierarchyTreeDataProvider implements vscode.TreeDataProvider<CallHierarchyItemNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<CallHierarchyItemNode | undefined | void> = new vscode.EventEmitter<CallHierarchyItemNode | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<CallHierarchyItemNode | undefined | void> = this._onDidChangeTreeData.event;

  private rootSymbolId: string | null = null;
  private mode: 'incoming' | 'outgoing' = 'incoming';

  constructor(
    private callGraph: CallGraph,
    private symbolResolver: SymbolResolver,
    private getConfig: () => { maxDepth: number; maxResults: number }
  ) {}

  public setRootSymbol(symbolId: string, mode: 'incoming' | 'outgoing' = 'incoming'): void {
    this.rootSymbolId = symbolId;
    this.mode = mode;
    this.refresh();
  }

  public setMode(mode: 'incoming' | 'outgoing'): void {
    this.mode = mode;
    this.refresh();
  }

  public getMode(): 'incoming' | 'outgoing' {
    return this.mode;
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: CallHierarchyItemNode): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: CallHierarchyItemNode): Promise<CallHierarchyItemNode[]> {
    if (!this.rootSymbolId) {
      return [];
    }

    const { maxDepth, maxResults } = this.getConfig();

    if (!element) {
      // Root Node
      const rootSymbol = this.symbolResolver.getSymbol(this.rootSymbolId);
      if (!rootSymbol) {
        return [];
      }

      const rootNode: CallHierarchyNode = {
        symbol: rootSymbol,
        direction: this.mode,
        parentSymbolIds: [rootSymbol.id],
        depth: 0
      };

      const childrenNodes = await this.fetchChildNodes(rootNode, maxResults);
      rootNode.childCount = childrenNodes.length;

      const treeNode = new CallHierarchyItemNode(
        rootNode,
        childrenNodes.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
      );

      return [treeNode];
    }

    // Children of an existing node
    const parentNode = element.hierarchyNode;
    if (parentNode.isCycle || parentNode.depth >= maxDepth) {
      return [];
    }

    const childHierarchyNodes = await this.fetchChildNodes(parentNode, maxResults);

    return childHierarchyNodes.map((childNode) => {
      const isCollapsible =
        !childNode.isCycle &&
        childNode.depth < maxDepth &&
        (childNode.childCount === undefined || childNode.childCount > 0);

      return new CallHierarchyItemNode(
        childNode,
        isCollapsible ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
      );
    });
  }

  private async fetchChildNodes(parentNode: CallHierarchyNode, maxResults: number): Promise<CallHierarchyNode[]> {
    const symbolId = parentNode.symbol.id;
    const currentDepth = parentNode.depth + 1;
    const parentPath = parentNode.parentSymbolIds;

    const childNodes: CallHierarchyNode[] = [];

    if (this.mode === 'incoming') {
      const incoming = this.callGraph.getIncomingCalls(symbolId);

      // Group incoming call sites by caller symbol ID to prevent duplicate tree items
      const groupedMap = new Map<string, { callerSymbol: SymbolInformation; callSites: any[] }>();
      for (const inc of incoming) {
        const id = inc.callerSymbol.id;
        let group = groupedMap.get(id);
        if (!group) {
          group = { callerSymbol: inc.callerSymbol, callSites: [] };
          groupedMap.set(id, group);
        }
        group.callSites.push(inc.callSite);
      }

      const limited = Array.from(groupedMap.values()).slice(0, maxResults);

      for (const group of limited) {
        const callerSymbol = group.callerSymbol;
        const isCycle = parentPath.includes(callerSymbol.id);

        const node: CallHierarchyNode = {
          symbol: callerSymbol,
          direction: 'incoming',
          callSite: group.callSites[0],
          parentSymbolIds: [...parentPath, callerSymbol.id],
          isCycle,
          depth: currentDepth,
          callSiteCount: group.callSites.length
        };

        if (!isCycle) {
          const grandChildren = this.callGraph.getIncomingCalls(callerSymbol.id);
          const uniqueCallerIds = new Set(grandChildren.map((g) => g.callerSymbol.id));
          node.childCount = uniqueCallerIds.size;
        }

        childNodes.push(node);
      }
    } else {
      // Outgoing
      const outgoing = this.callGraph.getOutgoingCalls(symbolId);

      // Group outgoing call sites by target symbol ID
      const groupedMap = new Map<string, { targetSymbol: SymbolInformation; callSites: any[] }>();
      for (const out of outgoing) {
        let targetSymbol = out.targetSymbol;
        if (!targetSymbol) {
          const dummyId = out.targetClass ? `${out.targetClass}::${out.targetName}` : out.targetName;
          targetSymbol = {
            id: dummyId,
            name: out.targetName,
            containerName: out.targetClass || '',
            fqcn: out.targetClass || '',
            kind: 'method',
            fileUri: out.callSite.fileUri,
            range: out.callSite.range,
            selectionRange: out.callSite.range
          };
        }

        const id = targetSymbol.id;
        let group = groupedMap.get(id);
        if (!group) {
          group = { targetSymbol, callSites: [] };
          groupedMap.set(id, group);
        }
        group.callSites.push(out.callSite);
      }

      const limited = Array.from(groupedMap.values()).slice(0, maxResults);

      for (const group of limited) {
        const targetSymbol = group.targetSymbol;
        const isCycle = parentPath.includes(targetSymbol.id);

        const node: CallHierarchyNode = {
          symbol: targetSymbol,
          direction: 'outgoing',
          callSite: group.callSites[0],
          parentSymbolIds: [...parentPath, targetSymbol.id],
          isCycle,
          depth: currentDepth,
          callSiteCount: group.callSites.length
        };

        if (!isCycle && targetSymbol.id) {
          const grandChildren = this.callGraph.getOutgoingCalls(targetSymbol.id);
          const uniqueTargetIds = new Set(
            grandChildren.map((g) =>
              g.targetSymbol ? g.targetSymbol.id : g.targetClass ? `${g.targetClass}::${g.targetName}` : g.targetName
            )
          );
          node.childCount = uniqueTargetIds.size;
        }

        childNodes.push(node);
      }
    }

    return childNodes;
  }
}
