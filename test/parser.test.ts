import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { PhpAstParser } from '../src/parser/phpParser';

describe('PhpAstParser Unit Tests', () => {
  const parser = new PhpAstParser();

  it('should parse basic PHP class, methods, and $this calls', () => {
    const filePath = path.join(__dirname, 'fixtures', 'BasicCall.php');
    const code = fs.readFileSync(filePath, 'utf-8');

    const result = parser.parse(code, filePath, 100);

    assert.strictEqual(result.classes.length, 1);
    assert.strictEqual(result.classes[0].fqcn, 'App\\Services\\UserService');

    const methodNames = result.symbols.map((s) => s.name);
    assert.ok(methodNames.includes('getUser'));
    assert.ok(methodNames.includes('findUser'));
    assert.ok(methodNames.includes('processUser'));

    // Check processUser calls
    const processUserCalls = result.callSites.filter(
      (c) => c.callerSymbolId === 'App\\Services\\UserService::processUser'
    );
    assert.strictEqual(processUserCalls.length, 2);
    const targetNames = processUserCalls.map((c) => c.targetName);
    assert.ok(targetNames.includes('findUser'));
    assert.ok(targetNames.includes('notifyUser'));
  });

  it('should parse static and self:: method calls', () => {
    const filePath = path.join(__dirname, 'fixtures', 'StaticAndSelf.php');
    const code = fs.readFileSync(filePath, 'utf-8');

    const result = parser.parse(code, filePath, 100);

    assert.strictEqual(result.classes.length, 2);

    const selfCall = result.callSites.find(
      (c) => c.callerSymbolId === 'App\\Utils\\MathUtil::square'
    );
    assert.ok(selfCall);
    assert.strictEqual(selfCall?.callType, 'self');
    assert.strictEqual(selfCall?.targetName, 'add');

    const staticCall = result.callSites.find(
      (c) => c.callerSymbolId === 'App\\Utils\\Calculator::compute'
    );
    assert.ok(staticCall);
    assert.strictEqual(staticCall?.callType, 'static');
    assert.strictEqual(staticCall?.targetClass, 'App\\Utils\\MathUtil');
    assert.strictEqual(staticCall?.targetName, 'square');
  });

  it('should parse interfaces, traits, and extends', () => {
    const filePath = path.join(__dirname, 'fixtures', 'InheritanceAndTraits.php');
    const code = fs.readFileSync(filePath, 'utf-8');

    const result = parser.parse(code, filePath, 100);

    const baseService = result.classes.find((c) => c.name === 'BaseService');
    assert.ok(baseService);
    assert.strictEqual(baseService?.implementsInterfaces[0], 'App\\Core\\Loggable');
    assert.strictEqual(baseService?.usedTraits[0], 'App\\Core\\HelperTrait');

    const orderService = result.classes.find((c) => c.name === 'OrderService');
    assert.ok(orderService);
    assert.strictEqual(orderService?.extendsClass, 'App\\Core\\BaseService');
  });
});
