export interface Range {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

export type SymbolKind = 'function' | 'method' | 'staticMethod' | 'class' | 'interface' | 'trait';

export type CallType = 'instance' | 'static' | 'self' | 'static_keyword' | 'parent' | 'function';

export interface SymbolInformation {
  id: string; // e.g. "App\Services\UserService::findUser" or "function:App\Utils\format_date"
  name: string; // e.g. "findUser"
  containerName: string; // e.g. "App\Services\UserService" or "App\Utils"
  fqcn: string; // e.g. "App\Services\UserService"
  kind: SymbolKind;
  fileUri: string;
  range: Range;
  selectionRange: Range;
  isStatic?: boolean;
  visibility?: 'public' | 'protected' | 'private';
}

export interface ClassDefinition {
  fqcn: string; // e.g. "App\Services\UserService"
  name: string; // e.g. "UserService"
  namespace: string; // e.g. "App\Services"
  kind: 'class' | 'interface' | 'trait';
  extendsClass?: string; // FQCN of parent class
  implementsInterfaces: string[]; // FQCNs of interfaces
  usedTraits: string[]; // FQCNs of traits
  fileUri: string;
  range: Range;
  useAliases: Record<string, string>; // e.g. { "User": "App\Models\User", "Str": "Illuminate\Support\Str" }
}

export interface CallSite {
  callerSymbolId: string; // Symbol ID of method/function containing this call
  targetName: string; // Method/function name being called
  targetClass: string | null; // Resolved or specified target class (FQCN) or alias if static call
  callType: CallType;
  fileUri: string;
  range: Range;
}

export interface FileIndexData {
  fileUri: string;
  mtime: number;
  classes: ClassDefinition[];
  symbols: SymbolInformation[];
  callSites: CallSite[];
}

export interface CallHierarchyNode {
  symbol: SymbolInformation;
  direction: 'incoming' | 'outgoing';
  callSite?: CallSite;
  parentSymbolIds: string[];
  isCycle?: boolean;
  depth: number;
  childCount?: number;
  callSiteCount?: number;
}

export interface ExtensionConfig {
  maxDepth: number;
  maxResults: number;
  excludePatterns: string[];
  autoIndexOnStart: boolean;
}
