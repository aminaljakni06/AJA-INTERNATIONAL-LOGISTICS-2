import { readFileSync } from 'node:fs';

const rulesPath = new URL('../firestore.rules', import.meta.url);
const rawRules = readFileSync(rulesPath, 'utf8');

const activeLines = rawRules
  .split('\n')
  .map((line, index) => ({
    lineNumber: index + 1,
    text: line.replace(/\/\/.*$/, '').trim(),
  }))
  .filter((line) => line.text);

const permissivePatterns = [
  /\ballow\s+read\s*,\s*write\s*:\s*if\s+true\s*;/,
  /\ballow\s+write\s*:\s*if\s+true\s*;/,
  /\ballow\s+read\s*:\s*if\s+true\s*;/,
  /\ballow\s+(?:create|update|delete)(?:\s*,\s*(?:create|update|delete))*\s*:\s*if\s+true\s*;/,
];

const failures = activeLines.flatMap((line) =>
  permissivePatterns
    .filter((pattern) => pattern.test(line.text))
    .map(() => ({
      lineNumber: line.lineNumber,
      text: line.text.replace(/\s+/g, ' '),
    }))
);

if (failures.length > 0) {
  console.error('Firestore rules audit failed: permissive public access rules were found.');
  for (const failure of failures) {
    console.error(`- firestore.rules:${failure.lineNumber} ${failure.text}`);
  }
  console.error('Replace public rules with authenticated, role-aware rules before staging or production approval.');
  process.exit(1);
}

console.log('Firestore rules audit passed: no unconditional public read/write rules found.');
