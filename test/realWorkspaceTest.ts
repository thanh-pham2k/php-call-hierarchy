import * as path from 'path';
import { SymbolResolver } from '../src/indexer/symbolResolver';
import { CallGraph } from '../src/graph/callGraph';
import { CacheManager } from '../src/cache/cacheManager';
import { WorkspaceIndexer } from '../src/indexer/workspaceIndexer';
import { CallHierarchyTreeDataProvider } from '../src/providers/CallHierarchyTreeDataProvider';
import { SymbolInformation } from '../src/models/types';

async function runRealWorkspaceTest() {
  console.log('====================================================');
  console.log('PHP Call Hierarchy - Real Workspace Test Benchmark');
  console.log('Target: C:\\laragon\\www\\TRANS_CREW_SERVER\\src\\server');
  console.log('====================================================');

  const targetPath = 'C:/laragon/www/TRANS_CREW_SERVER/src/server';

  const symbolResolver = new SymbolResolver();
  const callGraph = new CallGraph(symbolResolver);
  const cacheManager = new CacheManager();
  const indexer = new WorkspaceIndexer(symbolResolver, callGraph, cacheManager);

  const initialMemory = process.memoryUsage();
  console.log(`Initial Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);

  const excludePatterns = [
    '**/vendor/**',
    '**/node_modules/**',
    '**/storage/**',
    '**/cache/**',
    '**/build/**',
    '**/dist/**'
  ];

  console.log('\n--- 1. Workspace Indexing ---');
  const indexResult = await indexer.indexWorkspace(targetPath, { excludePatterns });

  const postIndexMemory = process.memoryUsage();
  console.log(`Index Time: ${indexResult.durationMs} ms`);
  console.log(`Indexed PHP Files: ${indexResult.indexedFiles} / ${indexResult.totalFiles}`);
  console.log(`Post-Index Heap Used: ${(postIndexMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Memory Delta: ${((postIndexMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB`);

  const allSymbolsMap = (symbolResolver as any).symbolsById as Map<string, SymbolInformation>;
  console.log(`Total Symbols Extracted: ${allSymbolsMap.size}`);

  const provider = new CallHierarchyTreeDataProvider(callGraph, symbolResolver, () => ({
    maxDepth: 5,
    maxResults: 50
  }));

  // Find candidate methods with references
  const candidateMethods: SymbolInformation[] = [];
  for (const symbol of allSymbolsMap.values()) {
    if (symbol.kind === 'method' || symbol.kind === 'staticMethod') {
      const incoming = callGraph.getIncomingCalls(symbol.id);
      const outgoing = callGraph.getOutgoingCalls(symbol.id);
      if (incoming.length > 0 || outgoing.length > 0) {
        candidateMethods.push(symbol);
      }
    }
  }

  // Sort candidate methods by total incoming + outgoing calls
  candidateMethods.sort((a, b) => {
    const totalA = callGraph.getIncomingCalls(a.id).length + callGraph.getOutgoingCalls(a.id).length;
    const totalB = callGraph.getIncomingCalls(b.id).length + callGraph.getOutgoingCalls(b.id).length;
    return totalB - totalA;
  });

  console.log(`\nFound ${candidateMethods.length} methods with call references.`);
  console.log('Top candidate methods for testing:');
  const testTargets = candidateMethods.slice(0, 5);
  for (const t of testTargets) {
    const incCount = callGraph.getIncomingCalls(t.id).length;
    const outCount = callGraph.getOutgoingCalls(t.id).length;
    console.log(` - [${t.id}] Incoming: ${incCount}, Outgoing: ${outCount} (File: ${path.basename(t.fileUri)}:${t.range.startLine + 1})`);
  }

  console.log('\n--- 2. Multi-Level Call Hierarchy Tree Traversal ---');

  for (let i = 0; i < Math.min(3, testTargets.length); i++) {
    const target = testTargets[i];
    console.log(`\n>>> Testing Target #${i + 1}: ${target.id}`);

    // Incoming Calls Test (3 levels)
    const incStart = Date.now();
    provider.setRootSymbol(target.id, 'incoming');
    const rootNodesInc = await provider.getChildren();

    let incL1Count = 0;
    let incL2Count = 0;
    let incL3Count = 0;

    if (rootNodesInc.length > 0) {
      const l1Nodes = await provider.getChildren(rootNodesInc[0]);
      incL1Count = l1Nodes.length;
      for (const node1 of l1Nodes.slice(0, 3)) {
        const l2Nodes = await provider.getChildren(node1);
        incL2Count += l2Nodes.length;
        for (const node2 of l2Nodes.slice(0, 3)) {
          const l3Nodes = await provider.getChildren(node2);
          incL3Count += l3Nodes.length;
        }
      }
    }
    const incExpandTime = Date.now() - incStart;
    console.log(`  Incoming Calls (Time: ${incExpandTime} ms): L1=${incL1Count}, L2=${incL2Count}, L3=${incL3Count}`);

    // Outgoing Calls Test (3 levels)
    const outStart = Date.now();
    provider.setRootSymbol(target.id, 'outgoing');
    const rootNodesOut = await provider.getChildren();

    let outL1Count = 0;
    let outL2Count = 0;
    let outL3Count = 0;

    if (rootNodesOut.length > 0) {
      const l1Nodes = await provider.getChildren(rootNodesOut[0]);
      outL1Count = l1Nodes.length;
      for (const node1 of l1Nodes.slice(0, 3)) {
        const l2Nodes = await provider.getChildren(node1);
        outL2Count += l2Nodes.length;
        for (const node2 of l2Nodes.slice(0, 3)) {
          const l3Nodes = await provider.getChildren(node2);
          outL3Count += l3Nodes.length;
        }
      }
    }
    const outExpandTime = Date.now() - outStart;
    console.log(`  Outgoing Calls (Time: ${outExpandTime} ms): L1=${outL1Count}, L2=${outL2Count}, L3=${outL3Count}`);
  }

  console.log('\n====================================================');
  console.log('Real Workspace Benchmark Completed Successfully');
  console.log('====================================================');

  indexer.dispose();
}

runRealWorkspaceTest().catch((err) => {
  console.error('Real workspace benchmark failed:', err);
  process.exit(1);
});
