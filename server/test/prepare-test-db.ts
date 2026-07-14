import { spawnSync } from 'node:child_process';
import { configureIsolatedTestEnvironment } from './test-environment';

configureIsolatedTestEnvironment();

const command = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
for (const args of [['generate'], ['db', 'push', '--skip-generate']]) {
  const result = spawnSync(command, args, {
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
