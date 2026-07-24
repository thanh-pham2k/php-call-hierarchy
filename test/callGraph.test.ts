import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { PhpAstParser } from '../src/parser/phpParser';
import { SymbolResolver } from '../src/indexer/symbolResolver';
import { CallGraph } from '../src/graph/callGraph';

describe('CallGraph & Integration Unit Tests', () => {
  let resolver: SymbolResolver;
  let graph: CallGraph;
  let parser: PhpAstParser;

  beforeEach(() => {
    resolver = new SymbolResolver();
    graph = new CallGraph(resolver);
    parser = new PhpAstParser();
  });

  it('should build incoming and outgoing call graph correctly for BasicCall.php', () => {
    const filePath = path.join(__dirname, 'fixtures', 'BasicCall.php');
    const code = fs.readFileSync(filePath, 'utf-8');
    const data = parser.parse(code, filePath, 100);

    for (const cls of data.classes) resolver.addClass(cls);
    for (const sym of data.symbols) resolver.addSymbol(sym);
    for (const site of data.callSites) graph.addCallSite(site);

    // Outgoing calls from processUser
    const outgoing = graph.getOutgoingCalls('App\\Services\\UserService::processUser');
    assert.strictEqual(outgoing.length, 2);
    const targetNames = outgoing.map((o) => o.targetName);
    assert.ok(targetNames.includes('findUser'));
    assert.ok(targetNames.includes('notifyUser'));

    // Incoming calls to findUser
    const incomingToFindUser = graph.getIncomingCalls('App\\Services\\UserService::findUser');
    assert.strictEqual(incomingToFindUser.length, 1);
    assert.strictEqual(incomingToFindUser[0].callerSymbol.id, 'App\\Services\\UserService::processUser');

    // Incoming calls to getUser
    const incomingToGetUser = graph.getIncomingCalls('App\\Services\\UserService::getUser');
    assert.strictEqual(incomingToGetUser.length, 1);
    assert.strictEqual(incomingToGetUser[0].callerSymbol.id, 'App\\Services\\UserService::findUser');
  });

  it('should resolve static call incoming and outgoing calls for StaticAndSelf.php', () => {
    const filePath = path.join(__dirname, 'fixtures', 'StaticAndSelf.php');
    const code = fs.readFileSync(filePath, 'utf-8');
    const data = parser.parse(code, filePath, 100);

    for (const cls of data.classes) resolver.addClass(cls);
    for (const sym of data.symbols) resolver.addSymbol(sym);
    for (const site of data.callSites) graph.addCallSite(site);

    // Outgoing from Calculator::compute -> MathUtil::square
    const computeOutgoing = graph.getOutgoingCalls('App\\Utils\\Calculator::compute');
    assert.strictEqual(computeOutgoing.length, 1);
    assert.strictEqual(computeOutgoing[0].targetSymbol?.id, 'App\\Utils\\MathUtil::square');

    // Incoming to MathUtil::square
    const squareIncoming = graph.getIncomingCalls('App\\Utils\\MathUtil::square');
    assert.strictEqual(squareIncoming.length, 1);
    assert.strictEqual(squareIncoming[0].callerSymbol.id, 'App\\Utils\\Calculator::compute');
  });
});
