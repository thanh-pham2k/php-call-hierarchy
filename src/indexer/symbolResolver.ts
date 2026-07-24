import { ClassDefinition, SymbolInformation } from '../models/types';

export class SymbolResolver {
  private classesByFqcn: Map<string, ClassDefinition> = new Map();
  private symbolsById: Map<string, SymbolInformation> = new Map();
  private classMethods: Map<string, Map<string, SymbolInformation>> = new Map();
  private descendantsCache: Map<string, string[]> = new Map();

  public addClass(classDef: ClassDefinition): void {
    this.classesByFqcn.set(classDef.fqcn, classDef);
    this.descendantsCache.clear();
  }

  public removeClass(fqcn: string): void {
    this.classesByFqcn.delete(fqcn);
    this.descendantsCache.clear();
  }

  public addSymbol(symbol: SymbolInformation): void {
    this.symbolsById.set(symbol.id, symbol);

    if (symbol.kind === 'method' || symbol.kind === 'staticMethod') {
      let methodsMap = this.classMethods.get(symbol.containerName);
      if (!methodsMap) {
        methodsMap = new Map();
        this.classMethods.set(symbol.containerName, methodsMap);
      }
      methodsMap.set(symbol.name, symbol);
    }
  }

  public removeSymbol(symbolId: string): void {
    const symbol = this.symbolsById.get(symbolId);
    if (symbol) {
      if (symbol.kind === 'method' || symbol.kind === 'staticMethod') {
        const methodsMap = this.classMethods.get(symbol.containerName);
        if (methodsMap) {
          methodsMap.delete(symbol.name);
        }
      }
      this.symbolsById.delete(symbolId);
    }
  }

  public getSymbol(symbolId: string): SymbolInformation | undefined {
    return this.symbolsById.get(symbolId);
  }

  public getClass(fqcn: string): ClassDefinition | undefined {
    return this.classesByFqcn.get(fqcn);
  }

  /**
   * Resolve method symbol for a given class FQCN and method name.
   * Walks up parent classes, traits, and interfaces if not directly declared in class FQCN.
   */
  public resolveMethod(targetClassFqcn: string, methodName: string): SymbolInformation | undefined {
    const directSymbolId = `${targetClassFqcn}::${methodName}`;
    const directSymbol = this.symbolsById.get(directSymbolId);
    if (directSymbol) {
      return directSymbol;
    }

    // Traverse ancestors (parent classes, traits)
    const visited = new Set<string>();
    const queue = [targetClassFqcn];

    while (queue.length > 0) {
      const currentFqcn = queue.shift()!;
      if (visited.has(currentFqcn)) continue;
      visited.add(currentFqcn);

      const symbolId = `${currentFqcn}::${methodName}`;
      const symbol = this.symbolsById.get(symbolId);
      if (symbol) {
        return symbol;
      }

      const classDef = this.classesByFqcn.get(currentFqcn);
      if (classDef) {
        if (classDef.extendsClass) {
          queue.push(classDef.extendsClass);
        }
        for (const traitFqcn of classDef.usedTraits) {
          queue.push(traitFqcn);
        }
        for (const interfaceFqcn of classDef.implementsInterfaces) {
          queue.push(interfaceFqcn);
        }
      }
    }

    return undefined;
  }

  /**
   * Find all subclasses (descendants) that inherit or implement the target class/interface/trait.
   */
  public getDescendants(targetClassFqcn: string): string[] {
    if (this.descendantsCache.has(targetClassFqcn)) {
      return this.descendantsCache.get(targetClassFqcn)!;
    }

    const descendants: string[] = [];

    for (const [fqcn, classDef] of this.classesByFqcn.entries()) {
      if (fqcn === targetClassFqcn) continue;

      if (
        classDef.extendsClass === targetClassFqcn ||
        classDef.implementsInterfaces.includes(targetClassFqcn) ||
        classDef.usedTraits.includes(targetClassFqcn)
      ) {
        descendants.push(fqcn);
        descendants.push(...this.getDescendants(fqcn));
      }
    }

    const result = Array.from(new Set(descendants));
    this.descendantsCache.set(targetClassFqcn, result);
    return result;
  }

  /**
   * Clear all symbols and class definitions
   */
  public clear(): void {
    this.classesByFqcn.clear();
    this.symbolsById.clear();
    this.classMethods.clear();
    this.descendantsCache.clear();
  }
}
