import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const projectId = process.env.FIREBASE_PROJECT_ID || 'aja-logistics-local';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const isWindows = process.platform === 'win32';
const firebaseCommand = process.env.FIREBASE_CLI || 'npx';
const firebaseArgs =
  firebaseCommand === 'npx'
    ? ['--yes', 'firebase-tools']
    : [];

const findLocalJavaHome = () => {
  const localJdkRoot = resolve('.tools', 'jdk21');
  if (!existsSync(localJdkRoot)) {
    return null;
  }

  return readdirSync(localJdkRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(localJdkRoot, entry.name))
    .find((candidate) => existsSync(join(candidate, 'bin', isWindows ? 'java.exe' : 'java'))) || null;
};

const envJavaHome =
  process.env.JAVA_HOME &&
  existsSync(join(process.env.JAVA_HOME, 'bin', isWindows ? 'java.exe' : 'java'))
    ? process.env.JAVA_HOME
    : null;
const javaHome = envJavaHome || findLocalJavaHome();
const javaCommand = javaHome ? join(javaHome, 'bin', isWindows ? 'java.exe' : 'java') : 'java';
const childEnv = {
  ...process.env,
  ...(javaHome
    ? {
        JAVA_HOME: javaHome,
        PATH: `${join(javaHome, 'bin')}${isWindows ? ';' : ':'}${process.env.PATH || ''}`,
      }
    : {}),
  FIRESTORE_EMULATOR_HOST: emulatorHost,
  RUN_FIRESTORE_TESTS: '1',
  DISABLE_LOCAL_DATA_FALLBACK: 'true',
};

const javaVersionResult = spawnSync(javaCommand, ['-version'], {
  encoding: 'utf8',
  shell: isWindows,
});

if (javaVersionResult.error) {
  console.error('Firestore emulator preflight failed: Java is required but was not found on PATH.');
  console.error('Install JDK 21 or newer, then rerun npm run test:integration:firestore:emulator.');
  process.exit(1);
}

const javaVersionOutput = `${javaVersionResult.stderr || ''}\n${javaVersionResult.stdout || ''}`;
const javaVersionMatch = javaVersionOutput.match(/version\s+"(?<version>\d+)(?:\.(?<minor>\d+))?/);
const javaMajorVersion = javaVersionMatch?.groups?.version === '1'
  ? Number(javaVersionMatch.groups.minor)
  : Number(javaVersionMatch?.groups?.version);

if (!Number.isFinite(javaMajorVersion) || javaMajorVersion < 21) {
  console.error('Firestore emulator preflight failed: firebase-tools requires JDK 21 or newer.');
  console.error(javaVersionOutput.trim());
  console.error('Install JDK 21 or newer, then rerun npm run test:integration:firestore:emulator.');
  process.exit(1);
}

const commandArgs = [
  ...firebaseArgs,
  'emulators:exec',
  '--only',
  'firestore',
  '--project',
  projectId,
  'npm run test:integration:firestore',
];

const quoteArg = (arg) => {
  if (!isWindows && !/[\s"'\\]/.test(arg)) {
    return arg;
  }

  return `"${arg.replace(/(["\\])/g, '\\$1')}"`;
};

const result = isWindows
  ? spawnSync(
      `${firebaseCommand} ${commandArgs.map(quoteArg).join(' ')}`,
      {
        stdio: 'inherit',
        shell: true,
        env: childEnv,
      }
    )
  : spawnSync(firebaseCommand, commandArgs, {
      stdio: 'inherit',
      shell: false,
      env: childEnv,
    });

if (result.error) {
  console.error(`Failed to start Firebase emulator command: ${result.error.message}`);
}

process.exit(result.status ?? 1);
