// Runs the test suite against an isolated database so tests never touch real data:
// - PostgreSQL: same server, dedicated "test" schema (reset on every run)
// - SQLite: throwaway file
import 'dotenv/config';
import { spawnSync } from 'node:child_process';

let url = process.env.DATABASE_URL ?? '';
if (url.startsWith('postgres')) {
  url += (url.includes('?') ? '&' : '?') + 'schema=test';
} else {
  url = 'file:./test.db';
}

const env = { ...process.env, DATABASE_URL: url };
const run = (args) => {
  const r = spawnSync('npx', args, { stdio: 'inherit', env });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run(['prisma', 'db', 'push', '--force-reset', '--skip-generate']);
run(['vitest', 'run']);
