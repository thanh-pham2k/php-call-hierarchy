const Engine = require('php-parser');
import { ClassDefinition, SymbolInformation, CallSite, FileIndexData, Range } from '../models/types';

export class PhpAstParser {
  private engine: any;

  constructor() {
    this.engine = new Engine({
      parser: {
        extractDoc: true,
        suppressErrors: true
      },
      ast: {
        withPositions: true,
        withComments: false
      }
    });
  }

  public parse(code: string, fileUri: string, mtime: number): FileIndexData {
    const classes: ClassDefinition[] = [];
    const symbols: SymbolInformation[] = [];
    const callSites: CallSite[] = [];

    try {
      const ast = this.engine.parseCode(code, fileUri);
      this.traverseProgram(ast, fileUri, classes, symbols, callSites);
    } catch (err) {
      // Return empty/partial results if parse fails
    }

    return {
      fileUri,
      mtime,
      classes,
      symbols,
      callSites
    };
  }

  private traverseProgram(
    ast: any,
    fileUri: string,
    classes: ClassDefinition[],
    symbols: SymbolInformation[],
    callSites: CallSite[]
  ): void {
    if (!ast || typeof ast !== 'object') {
      return;
    }

    let currentNamespace = '';
    const currentAliases: Record<string, string> = {};

    const children = ast.children || ast.body || (Array.isArray(ast) ? ast : []);

    for (const node of children) {
      if (!node || typeof node !== 'object') continue;

      if (node.kind === 'namespace') {
        currentNamespace = this.getNodeName(node.name) || '';
        const nsChildren = node.children || node.body || [];
        this.traverseTopLevelNodes(nsChildren, currentNamespace, { ...currentAliases }, fileUri, classes, symbols, callSites);
      } else {
        this.traverseTopLevelNode(node, currentNamespace, currentAliases, fileUri, classes, symbols, callSites);
      }
    }
  }

  private traverseTopLevelNodes(
    nodes: any[],
    namespace: string,
    aliases: Record<string, string>,
    fileUri: string,
    classes: ClassDefinition[],
    symbols: SymbolInformation[],
    callSites: CallSite[]
  ): void {
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      this.traverseTopLevelNode(node, namespace, aliases, fileUri, classes, symbols, callSites);
    }
  }

  private traverseTopLevelNode(
    node: any,
    namespace: string,
    aliases: Record<string, string>,
    fileUri: string,
    classes: ClassDefinition[],
    symbols: SymbolInformation[],
    callSites: CallSite[]
  ): void {
    if (node.kind === 'usegroup') {
      this.extractUseGroup(node, aliases);
    } else if (node.kind === 'class' || node.kind === 'interface' || node.kind === 'trait') {
      this.extractClassLike(node, namespace, aliases, fileUri, classes, symbols, callSites);
    } else if (node.kind === 'function') {
      this.extractStandaloneFunction(node, namespace, aliases, fileUri, symbols, callSites);
    }
  }

  private extractUseGroup(node: any, aliases: Record<string, string>): void {
    const items = node.items || [];
    for (const item of items) {
      if (!item) continue;
      const rawName = item.name || '';
      const fqcn = rawName.startsWith('\\') ? rawName.substring(1) : rawName;
      let alias = item.alias;
      if (alias && typeof alias === 'object') {
        alias = alias.name || alias;
      }
      if (!alias) {
        const parts = fqcn.split('\\');
        alias = parts[parts.length - 1];
      }
      if (typeof alias === 'string' && alias.length > 0) {
        aliases[alias] = fqcn;
      }
    }
  }

  private extractClassLike(
    node: any,
    namespace: string,
    aliases: Record<string, string>,
    fileUri: string,
    classes: ClassDefinition[],
    symbols: SymbolInformation[],
    callSites: CallSite[]
  ): void {
    const className = this.getNodeName(node.name);
    if (!className) return;

    const fqcn = namespace ? `${namespace}\\${className}` : className;
    const kind = node.kind as 'class' | 'interface' | 'trait';

    let extendsClass: string | undefined;
    if (node.extends) {
      const extName = Array.isArray(node.extends) ? this.getNodeName(node.extends[0]) : this.getNodeName(node.extends);
      if (extName) {
        extendsClass = this.resolveFqcn(extName, namespace, aliases);
      }
    }

    const implementsInterfaces: string[] = [];
    if (node.implements && Array.isArray(node.implements)) {
      for (const impl of node.implements) {
        const implName = this.getNodeName(impl);
        if (implName) {
          implementsInterfaces.push(this.resolveFqcn(implName, namespace, aliases));
        }
      }
    }

    const usedTraits: string[] = [];
    const bodyNodes = node.body || node.children || [];

    for (const child of bodyNodes) {
      if (child && child.kind === 'traituse') {
        const traits = child.traits || [];
        for (const t of traits) {
          const tName = this.getNodeName(t);
          if (tName) {
            usedTraits.push(this.resolveFqcn(tName, namespace, aliases));
          }
        }
      }
    }

    const classDef: ClassDefinition = {
      fqcn,
      name: className,
      namespace,
      kind,
      extendsClass,
      implementsInterfaces,
      usedTraits,
      fileUri,
      range: this.getRange(node),
      useAliases: { ...aliases }
    };
    classes.push(classDef);

    // Extract Class Symbol itself
    symbols.push({
      id: fqcn,
      name: className,
      containerName: namespace,
      fqcn,
      kind,
      fileUri,
      range: classDef.range,
      selectionRange: this.getRange(node.name || node)
    });

    // Extract Methods inside Class
    for (const child of bodyNodes) {
      if (!child || typeof child !== 'object') continue;
      if (child.kind === 'method') {
        this.extractMethod(child, fqcn, namespace, aliases, fileUri, symbols, callSites);
      }
    }
  }

  private extractMethod(
    node: any,
    classFqcn: string,
    namespace: string,
    aliases: Record<string, string>,
    fileUri: string,
    symbols: SymbolInformation[],
    callSites: CallSite[]
  ): void {
    const methodName = this.getNodeName(node.name);
    if (!methodName) return;

    const symbolId = `${classFqcn}::${methodName}`;
    const isStatic = Boolean(node.isStatic);
    const visibility = node.visibility || 'public';
    const range = this.getRange(node);
    const selectionRange = this.getRange(node.name || node);

    const symbol: SymbolInformation = {
      id: symbolId,
      name: methodName,
      containerName: classFqcn,
      fqcn: classFqcn,
      kind: isStatic ? 'staticMethod' : 'method',
      fileUri,
      range,
      selectionRange,
      isStatic,
      visibility
    };
    symbols.push(symbol);

    // Extract Call sites inside method body
    if (node.body) {
      this.extractCallsInAst(node.body, symbolId, classFqcn, namespace, aliases, fileUri, callSites);
    }
  }

  private extractStandaloneFunction(
    node: any,
    namespace: string,
    aliases: Record<string, string>,
    fileUri: string,
    symbols: SymbolInformation[],
    callSites: CallSite[]
  ): void {
    const funcName = this.getNodeName(node.name);
    if (!funcName) return;

    const fqcn = namespace ? `${namespace}\\${funcName}` : funcName;
    const symbolId = `function:${fqcn}`;
    const range = this.getRange(node);
    const selectionRange = this.getRange(node.name || node);

    const symbol: SymbolInformation = {
      id: symbolId,
      name: funcName,
      containerName: namespace,
      fqcn,
      kind: 'function',
      fileUri,
      range,
      selectionRange
    };
    symbols.push(symbol);

    if (node.body) {
      this.extractCallsInAst(node.body, symbolId, namespace, namespace, aliases, fileUri, callSites);
    }
  }

  private extractCallsInAst(
    astNode: any,
    callerSymbolId: string,
    enclosingClassFqcn: string,
    namespace: string,
    aliases: Record<string, string>,
    fileUri: string,
    callSites: CallSite[]
  ): void {
    if (!astNode || typeof astNode !== 'object') return;

    // Check if this node is a Call or StaticLookup / PropertyLookup Call
    if (astNode.kind === 'call') {
      this.processCallNode(astNode, callerSymbolId, enclosingClassFqcn, namespace, aliases, fileUri, callSites);
    }

    // Recursively traverse child AST nodes
    for (const key of Object.keys(astNode)) {
      if (key === 'loc' || key === 'comments' || key === 'doc') continue;
      const val = astNode[key];
      if (Array.isArray(val)) {
        for (const child of val) {
          if (child && typeof child === 'object') {
            this.extractCallsInAst(child, callerSymbolId, enclosingClassFqcn, namespace, aliases, fileUri, callSites);
          }
        }
      } else if (val && typeof val === 'object' && val.kind) {
        this.extractCallsInAst(val, callerSymbolId, enclosingClassFqcn, namespace, aliases, fileUri, callSites);
      }
    }
  }

  private processCallNode(
    callNode: any,
    callerSymbolId: string,
    enclosingClassFqcn: string,
    namespace: string,
    aliases: Record<string, string>,
    fileUri: string,
    callSites: CallSite[]
  ): void {
    const what = callNode.what;
    if (!what) return;

    const range = this.getRange(callNode);

    if (what.kind === 'propertylookup') {
      // $obj->methodName() or $this->methodName()
      const targetName = this.getNodeName(what.offset);
      if (targetName) {
        const objExpr = what.what;
        let isThis = false;
        if (objExpr && (objExpr.kind === 'variable' || objExpr.name === 'this')) {
          if (objExpr.name === 'this' || objExpr.name?.name === 'this') {
            isThis = true;
          }
        }

        callSites.push({
          callerSymbolId,
          targetName,
          targetClass: isThis ? enclosingClassFqcn : null,
          callType: isThis ? 'instance' : 'instance',
          fileUri,
          range
        });
      }
    } else if (what.kind === 'staticlookup') {
      // Class::method(), self::method(), static::method(), parent::method()
      const targetName = this.getNodeName(what.offset);
      const classRef = this.getNodeName(what.what);

      if (targetName && classRef) {
        let callType: any = 'static';
        let targetClass: string | null = null;

        const lowerRef = classRef.toLowerCase();
        if (lowerRef === 'self') {
          callType = 'self';
          targetClass = enclosingClassFqcn;
        } else if (lowerRef === 'static') {
          callType = 'static_keyword';
          targetClass = enclosingClassFqcn;
        } else if (lowerRef === 'parent') {
          callType = 'parent';
          targetClass = enclosingClassFqcn; // Will resolve via inheritance in resolver
        } else {
          targetClass = this.resolveFqcn(classRef, namespace, aliases);
        }

        callSites.push({
          callerSymbolId,
          targetName,
          targetClass,
          callType,
          fileUri,
          range
        });
      }
    } else if (what.kind === 'name' || what.kind === 'identifier') {
      // Standalone function call: func_name()
      const funcName = this.getNodeName(what);
      if (funcName) {
        const targetClass = this.resolveFqcn(funcName, namespace, aliases);
        callSites.push({
          callerSymbolId,
          targetName: funcName,
          targetClass: targetClass !== funcName ? targetClass : null,
          callType: 'function',
          fileUri,
          range
        });
      }
    }
  }

  public resolveFqcn(name: string, currentNamespace: string, aliases: Record<string, string>): string {
    if (!name) return '';
    if (name.startsWith('\\')) {
      return name.substring(1);
    }
    const parts = name.split('\\');
    const firstPart = parts[0];

    if (aliases[firstPart]) {
      if (parts.length > 1) {
        return `${aliases[firstPart]}\\${parts.slice(1).join('\\')}`;
      }
      return aliases[firstPart];
    }

    return currentNamespace ? `${currentNamespace}\\${name}` : name;
  }

  private getNodeName(node: any): string | null {
    if (!node) return null;
    if (typeof node === 'string') return node;
    if (typeof node.name === 'string') return node.name;
    if (typeof node.value === 'string') return node.value;
    if (typeof node.raw === 'string') return node.raw;
    if (node.kind === 'selfreference') return 'self';
    if (node.kind === 'staticreference') return 'static';
    if (node.kind === 'parentreference') return 'parent';
    if (node.kind === 'name' || node.kind === 'identifier') {
      return node.name || node.value || null;
    }
    return null;
  }

  private getRange(node: any): Range {
    if (node && node.loc) {
      return {
        startLine: (node.loc.start ? node.loc.start.line : 1) - 1,
        startCol: (node.loc.start ? node.loc.start.column : 0),
        endLine: (node.loc.end ? node.loc.end.line : 1) - 1,
        endCol: (node.loc.end ? node.loc.end.column : 0)
      };
    }
    return { startLine: 0, startCol: 0, endLine: 0, endCol: 0 };
  }
}
