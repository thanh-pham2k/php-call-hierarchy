import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { PhpAstParser } from '../src/parser/phpParser';
import { SymbolResolver } from '../src/indexer/symbolResolver';
import { CallGraph } from '../src/graph/callGraph';
import { CallHierarchyTreeDataProvider } from '../src/providers/CallHierarchyTreeDataProvider';

describe('Cycle / Recursion Detection Unit Tests', () => {
  let resolver: SymbolResolver;
  let graph: CallGraph;
  let parser: PhpAstParser;
  let provider: CallHierarchyTreeDataProvider;

  beforeEach(() => {
    resolver = new SymbolResolver();
    graph = new CallGraph(resolver);
    parser = new PhpAstParser();

    const filePath = path.join(__dirname, 'fixtures', 'CyclicCall.php');
    const code = fs.readFileSync(filePath, 'utf-8');
    const data = parser.parse(code, filePath, 100);

    for (const cls of data.classes) resolver.addClass(cls);
    for (const sym of data.symbols) resolver.addSymbol(sym);
    for (const site of data.callSites) graph.addCallSite(site);

    provider = new CallHierarchyTreeDataProvider(
      graph,
      resolver,
      () => ({ maxDepth: 5, maxResults: 50 })
    );
  });

  it('should detect recursion cycle when traversing outgoing calls methodA -> methodB -> methodA', async () => {
    provider.setRootSymbol('App\\Recursion\\RecursiveDemo::methodA', 'outgoing');

    const rootNodes = await provider.getChildren();
    assert.strictEqual(rootNodes.length, 1);
    assert.strictEqual(rootNodes[0].hierarchyNode.symbol.id, 'App\\Recursion\\RecursiveDemo::methodA');

    // Level 1: methodA -> methodB
    const level1Nodes = await provider.getChildren(rootNodes[0]);
    assert.strictEqual(level1Nodes.length, 1);
    assert.strictEqual(level1Nodes[0].hierarchyNode.symbol.id, 'App\\Recursion\\RecursiveDemo::methodB');
    assert.strictEqual(level1Nodes[0].hierarchyNode.isCycle, false);

    // Level 2: methodB -> methodA (Cycle!)
    const level2Nodes = await provider.getChildren(level1Nodes[0]);
    assert.strictEqual(level2Nodes.length, 1);
    assert.strictEqual(level2Nodes[0].hierarchyNode.symbol.id, 'App\\Recursion\\RecursiveDemo::methodA');
    assert.strictEqual(level2Nodes[0].hierarchyNode.isCycle, true);

    // Level 3: Expanding a cycle node should return empty list to break infinite loop
    const level3Nodes = await provider.getChildren(level2Nodes[0]);
    assert.strictEqual(level3Nodes.length, 0);
  });
});
