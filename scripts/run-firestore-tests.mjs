import { spawnSync } from 'node:child_process';

const shouldRun = process.env.RUN_FIRESTORE_TESTS === '1' || Boolean(process.env.FIRESTORE_EMULATOR_HOST);

if (!shouldRun) {
  console.log(
    'Skipping Firestore integration tests. Set RUN_FIRESTORE_TESTS=1 or FIRESTORE_EMULATOR_HOST to run them.'
  );
  process.exit(0);
}

const tests = [
  'src/lib/exchange/importPlanning.test.ts',
  'src/services/analytics/analyticsAggregationEngine.test.ts',
  'src/services/reports/reportExecutionService.test.ts',
  'src/db/repositories/analytics/controlTowerAnalyticsRepository.test.ts',
  'src/server/routes/analyticsRoutes.test.ts',
  'src/lib/analytics/analyticsQueryIntegration.test.ts',
  'src/tests/importExecutionService.test.ts',
];

const result = spawnSync('npm', ['exec', '--', 'tsx', '--test', '--test-force-exit', ...tests], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
