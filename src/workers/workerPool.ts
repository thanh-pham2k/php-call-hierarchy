import { Worker } from 'worker_threads';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { FileIndexData } from '../models/types';
import { PhpAstParser } from '../parser/phpParser';

interface Task {
  id: number;
  fileUri: string;
  code: string;
  mtime: number;
  resolve: (data: FileIndexData) => void;
  reject: (err: any) => void;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private idleWorkers: Worker[] = [];
  private taskQueue: Task[] = [];
  private activeTasks: Map<number, Task> = new Map();
  private nextTaskId = 1;
  private fallbackParser: PhpAstParser | null = null;
  private useWorkers = true;

  constructor(maxWorkers?: number) {
    const numWorkers = maxWorkers || Math.min(os.cpus().length, 4);
    let workerScript = path.join(__dirname, 'indexer.worker.js');
    if (!fs.existsSync(workerScript)) {
      const distScript = path.join(__dirname, '..', '..', 'dist', 'workers', 'indexer.worker.js');
      if (fs.existsSync(distScript)) {
        workerScript = distScript;
      } else {
        const distScript2 = path.join(__dirname, 'workers', 'indexer.worker.js');
        if (fs.existsSync(distScript2)) {
          workerScript = distScript2;
        }
      }
    }

    if (fs.existsSync(workerScript)) {
      try {
        for (let i = 0; i < numWorkers; i++) {
          const worker = new Worker(workerScript);
          worker.on('message', (msg: { id: number; data: FileIndexData | null; error: string | null }) => {
            this.handleWorkerResult(worker, msg);
          });
          worker.on('error', (err) => {
            console.error('Worker thread error:', err);
            this.useWorkers = false;
          });
          this.workers.push(worker);
          this.idleWorkers.push(worker);
        }
      } catch (e) {
        console.warn('WorkerPool failed to initialize worker threads, falling back to main thread parsing:', e);
        this.useWorkers = false;
        this.fallbackParser = new PhpAstParser();
      }
    } else {
      this.useWorkers = false;
      this.fallbackParser = new PhpAstParser();
    }
  }

  public async parseFile(fileUri: string, code: string, mtime: number): Promise<FileIndexData> {
    if (!this.useWorkers || this.workers.length === 0) {
      if (!this.fallbackParser) {
        this.fallbackParser = new PhpAstParser();
      }
      return this.fallbackParser.parse(code, fileUri, mtime);
    }

    return new Promise((resolve, reject) => {
      const taskId = this.nextTaskId++;
      const task: Task = { id: taskId, fileUri, code, mtime, resolve, reject };

      const worker = this.idleWorkers.pop();
      if (worker) {
        this.dispatchTask(worker, task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  private dispatchTask(worker: Worker, task: Task): void {
    this.activeTasks.set(task.id, task);
    worker.postMessage({ id: task.id, fileUri: task.fileUri, code: task.code, mtime: task.mtime });
  }

  private handleWorkerResult(worker: Worker, msg: { id: number; data: FileIndexData | null; error: string | null }): void {
    const task = this.activeTasks.get(msg.id);
    if (task) {
      this.activeTasks.delete(msg.id);
      if (msg.error) {
        task.reject(new Error(msg.error));
      } else if (msg.data) {
        task.resolve(msg.data);
      } else {
        task.reject(new Error('No data returned from worker'));
      }
    }

    const nextTask = this.taskQueue.shift();
    if (nextTask) {
      this.dispatchTask(worker, nextTask);
    } else {
      this.idleWorkers.push(worker);
    }
  }

  public dispose(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.idleWorkers = [];
    this.activeTasks.clear();
    this.taskQueue = [];
  }
}
