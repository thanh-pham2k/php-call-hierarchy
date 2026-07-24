const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

async function build() {
  const ctxExtension = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    sourcemap: true,
    target: 'node16'
  });

  const ctxWorker = await esbuild.context({
    entryPoints: ['src/workers/indexer.worker.ts'],
    bundle: true,
    outfile: 'dist/workers/indexer.worker.js',
    format: 'cjs',
    platform: 'node',
    sourcemap: true,
    target: 'node16'
  });

  if (isWatch) {
    await ctxExtension.watch();
    await ctxWorker.watch();
    console.log('Watching for changes...');
  } else {
    await ctxExtension.rebuild();
    await ctxWorker.rebuild();
    await ctxExtension.dispose();
    await ctxWorker.dispose();
    console.log('Build completed successfully.');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
