import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const clientEntryRoots = ['components', 'context', 'hooks', 'pages'].map((dir) => path.join(srcDir, dir));
const clientEntryFiles = ['App.tsx', 'App.ts', 'main.tsx', 'main.ts', 'index.tsx', 'index.ts']
  .map((fileName) => path.join(srcDir, fileName))
  .filter(existsSync);
const forbiddenImports = [
  'firebase-admin',
  '../server/firebaseAdmin',
  '../../server/firebaseAdmin',
  '../../../server/firebaseAdmin',
  'src/server/firebaseAdmin',
];
const forbiddenPathSegments = [
  '/src/server/firebaseAdmin.ts',
];
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

function isForbiddenResolvedPath(filePath) {
  const normalized = toPosixAbsolute(filePath);
  return forbiddenPathSegments.some((segment) => normalized.includes(segment));
}

const violations = [];
const visited = new Set();

function auditFile(filePath, importStack = []) {
  const resolvedPath = path.resolve(filePath);
  if (visited.has(resolvedPath)) return;
  visited.add(resolvedPath);

  const content = readFileSync(filePath, 'utf8');
  for (const forbiddenImport of forbiddenImports) {
    if (content.includes(forbiddenImport)) {
      violations.push({
        filePath: toPosixRelative(filePath),
        forbiddenImport,
        importStack,
      });
    }
  }

  if (isForbiddenResolvedPath(filePath)) {
    violations.push({
      filePath: toPosixRelative(filePath),
      forbiddenImport: 'server-only repository/module path',
      importStack,
    });
  }

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

if (violations.length > 0) {
  console.error('Server-only import audit failed: client-bundled code imports server-only modules.');
  for (const violation of violations) {
    console.error(`- ${violation.filePath} imports ${violation.forbiddenImport}`);
    if (violation.importStack.length > 0) {
      console.error(`  via ${violation.importStack.join(' -> ')}`);
    }
  }
  process.exit(1);
}

console.log('Server-only import audit passed: no client imports of Firebase Admin/server-only modules found.');
