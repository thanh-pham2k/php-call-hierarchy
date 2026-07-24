import * as assert from 'assert';
import { SymbolResolver } from '../src/indexer/symbolResolver';
import { ClassDefinition, SymbolInformation } from '../src/models/types';

describe('SymbolResolver Unit Tests', () => {
  let resolver: SymbolResolver;

  beforeEach(() => {
    resolver = new SymbolResolver();
  });

  it('should resolve direct method in class', () => {
    const classDef: ClassDefinition = {
      fqcn: 'App\\Services\\UserService',
      name: 'UserService',
      namespace: 'App\\Services',
      kind: 'class',
      implementsInterfaces: [],
      usedTraits: [],
      fileUri: '/test/UserService.php',
      range: { startLine: 0, startCol: 0, endLine: 10, endCol: 0 },
      useAliases: {}
    };

    const symbol: SymbolInformation = {
      id: 'App\\Services\\UserService::getUser',
      name: 'getUser',
      containerName: 'App\\Services\\UserService',
      fqcn: 'App\\Services\\UserService',
      kind: 'method',
      fileUri: '/test/UserService.php',
      range: { startLine: 2, startCol: 4, endLine: 4, endCol: 5 },
      selectionRange: { startLine: 2, startCol: 20, endLine: 2, endCol: 27 }
    };

    resolver.addClass(classDef);
    resolver.addSymbol(symbol);

    const resolved = resolver.resolveMethod('App\\Services\\UserService', 'getUser');
    assert.ok(resolved);
    assert.strictEqual(resolved?.id, 'App\\Services\\UserService::getUser');
  });

  it('should resolve method inherited from parent class', () => {
    const parentClass: ClassDefinition = {
      fqcn: 'App\\Core\\BaseService',
      name: 'BaseService',
      namespace: 'App\\Core',
      kind: 'class',
      implementsInterfaces: [],
      usedTraits: [],
      fileUri: '/test/BaseService.php',
      range: { startLine: 0, startCol: 0, endLine: 10, endCol: 0 },
      useAliases: {}
    };

    const childClass: ClassDefinition = {
      fqcn: 'App\\Services\\OrderService',
      name: 'OrderService',
      namespace: 'App\\Services',
      kind: 'class',
      extendsClass: 'App\\Core\\BaseService',
      implementsInterfaces: [],
      usedTraits: [],
      fileUri: '/test/OrderService.php',
      range: { startLine: 0, startCol: 0, endLine: 10, endCol: 0 },
      useAliases: {}
    };

    const parentMethod: SymbolInformation = {
      id: 'App\\Core\\BaseService::log',
      name: 'log',
      containerName: 'App\\Core\\BaseService',
      fqcn: 'App\\Core\\BaseService',
      kind: 'method',
      fileUri: '/test/BaseService.php',
      range: { startLine: 2, startCol: 4, endLine: 4, endCol: 5 },
      selectionRange: { startLine: 2, startCol: 20, endLine: 2, endCol: 23 }
    };

    resolver.addClass(parentClass);
    resolver.addClass(childClass);
    resolver.addSymbol(parentMethod);

    const resolved = resolver.resolveMethod('App\\Services\\OrderService', 'log');
    assert.ok(resolved);
    assert.strictEqual(resolved?.id, 'App\\Core\\BaseService::log');
  });

  it('should find descendants of base class', () => {
    const parentClass: ClassDefinition = {
      fqcn: 'App\\Core\\BaseService',
      name: 'BaseService',
      namespace: 'App\\Core',
      kind: 'class',
      implementsInterfaces: [],
      usedTraits: [],
      fileUri: '/test/BaseService.php',
      range: { startLine: 0, startCol: 0, endLine: 10, endCol: 0 },
      useAliases: {}
    };

    const childClass: ClassDefinition = {
      fqcn: 'App\\Services\\OrderService',
      name: 'OrderService',
      namespace: 'App\\Services',
      kind: 'class',
      extendsClass: 'App\\Core\\BaseService',
      implementsInterfaces: [],
      usedTraits: [],
      fileUri: '/test/OrderService.php',
      range: { startLine: 0, startCol: 0, endLine: 10, endCol: 0 },
      useAliases: {}
    };

    resolver.addClass(parentClass);
    resolver.addClass(childClass);

    const descendants = resolver.getDescendants('App\\Core\\BaseService');
    assert.strictEqual(descendants.length, 1);
    assert.strictEqual(descendants[0], 'App\\Services\\OrderService');
  });
});
