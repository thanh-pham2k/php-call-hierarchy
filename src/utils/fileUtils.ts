import * as path from 'path';

export function normalizePath(filePath: string): string {
  let normalized = filePath.replace(/\\/g, '/');
  if (normalized.length > 1 && normalized[1] === ':') {
    normalized = normalized[0].toLowerCase() + normalized.substring(1);
  }
  return normalized;
}

export function relativePath(basePath: string, targetPath: string): string {
  const normBase = normalizePath(basePath);
  const normTarget = normalizePath(targetPath);
  return path.relative(normBase, normTarget).replace(/\\/g, '/');
}
