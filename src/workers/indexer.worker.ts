import { parentPort } from 'worker_threads';
import { PhpAstParser } from '../parser/phpParser';

const parser = new PhpAstParser();

if (parentPort) {
  parentPort.on('message', (msg: { id: number; fileUri: string; code: string; mtime: number }) => {
    try {
      const data = parser.parse(msg.code, msg.fileUri, msg.mtime);
      parentPort?.postMessage({ id: msg.id, data, error: null });
    } catch (err: any) {
      parentPort?.postMessage({ id: msg.id, data: null, error: err.message || String(err) });
    }
  });
}
