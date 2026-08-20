import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const clientEntryRoots = ['components', 'context', 'hooks', 'pages'].map((dir) => path.join(srcDir, dir));
const clientEntryFiles = ['App.tsx', 'App.ts', 'main.tsx', 'main.ts', 'index.tsx', 'index.ts']
  .map((fileName) => path.join(srcDir, fileName))
  .filter(existsSync);
const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosixRelative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, '/');
}

function toPosixAbsolute(filePath) {
  return path.resolve(filePath).replaceAll(path.sep, '/');
}

function resolveLocalImport(fromFile, specifier) {
  if (!specifier.startsWith('.')) {
    return undefined;
  }

  const basePath = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.js'),
    path.join(basePath, 'index.jsx'),
  ];

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

const repositoryImports = new Map();
const visited = new Set();

function auditFile(filePath, importStack = []) {
  const resolvedPath = path.resolve(filePath);
  if (visited.has(resolvedPath)) return;
  visited.add(resolvedPath);

  const normalized = toPosixAbsolute(filePath);
  if (normalized.includes('/src/db/repositories/')) {
    const relative = toPosixRelative(filePath);
    if (!repositoryImports.has(relative)) {
      repositoryImports.set(relative, importStack);
    }
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  importPattern.lastIndex = 0;

  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1] || match[2];
    const nextFile = resolveLocalImport(filePath, specifier);
    if (!nextFile || !toPosixAbsolute(nextFile).includes('/src/')) {
      continue;
    }

    auditFile(nextFile, [...importStack, toPosixRelative(filePath)]);
  }
}

for (const filePath of [
  ...clientEntryFiles,
  ...clientEntryRoots.flatMap((dir) => walk(dir)),
]) {
  auditFile(filePath);
}

if (repositoryImports.size === 0) {
  console.log('Client repository import inventory: no client entrypoints reach src/db/repositories.');
} else {
  console.log(`Client repository import inventory: ${repositoryImports.size} repository path(s) reachable from client entrypoints.`);
  for (const [repositoryPath, importStack] of [...repositoryImports.entries()].sort()) {
    console.log(`- ${repositoryPath}`);
    if (importStack.length > 0) {
      console.log(`  via ${importStack.join(' -> ')}`);
    }
  }
}
