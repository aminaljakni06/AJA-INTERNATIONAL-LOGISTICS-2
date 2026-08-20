import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const serviceDir = path.join(srcDir, 'services');
const clientRoots = ['components', 'context', 'hooks', 'pages'].map((dir) => path.join(srcDir, dir));

function walk(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }

  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosixRelative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, '/');
}

function serviceNameFromPath(filePath) {
  return path.basename(filePath).replace(/\.(ts|tsx)$/, '');
}

const firestoreServices = walk(serviceDir)
  .filter((filePath) => {
    const content = readFileSync(filePath, 'utf8');
    return content.includes('firebase/firestore') || content.includes('../lib/firebase');
  })
  .map((filePath) => ({
    name: serviceNameFromPath(filePath),
    path: filePath,
    relativePath: toPosixRelative(filePath),
  }));

const violations = [];

for (const clientFile of clientRoots.flatMap((dir) => walk(dir))) {
  const content = readFileSync(clientFile, 'utf8');
  const relativeClientPath = toPosixRelative(clientFile);

  for (const service of firestoreServices) {
    const importPattern = new RegExp(
      `from\\s+['"][^'"]*services/${service.name}['"]|from\\s+['"][^'"]*services/${service.name.replace(/Service$/, '')}['"]`
    );

    if (importPattern.test(content)) {
      violations.push({
        clientPath: relativeClientPath,
        servicePath: service.relativePath,
      });
    }
  }
}

if (violations.length > 0) {
  console.error('Firestore boundary audit failed: client-bundled code imports Firestore-backed services.');
  console.error('Move these calls behind server API routes before migrating server Firestore access to Firebase Admin SDK:');
  for (const violation of violations) {
    console.error(`- ${violation.clientPath} -> ${violation.servicePath}`);
  }
  process.exit(1);
}

console.log('Firestore boundary audit passed: no client imports of Firestore-backed services found.');
