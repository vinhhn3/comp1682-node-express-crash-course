#!/usr/bin/env node
/**
 * npm run step        → list the steps
 * npm run step 9      → checkout s09-errors and move the concept tab with it.
 *
 * The concept page lives at http://localhost:5173/concepts/step.html and follows
 * the git branch by itself. This script only changes the branch and opens the tab once.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const STEPS = {
  0: ['s00-raw-http', 'http.createServer, one route'],
  1: ['s01-express', 'Express, and what it removes'],
  2: ['s02-one-file', 'list + one item, all in server.js'],
  3: ['s03-json-body', 'express.json, POST, in-memory data'],
  4: ['s04-routers', 'routes/ and express.Router'],
  5: ['s05-controllers', 'controllers/ take over the handlers'],
  6: ['s06-repositories', 'repositories/ own the data'],
  7: ['s07-mongo-connect', 'MongoDB connects, and fails loudly'],
  8: ['s08-model', 'a Mongoose schema, and the repository swap'],
  9: ['s09-errors', '404, validation, one error handler'],
  10: ['s10-update-delete', 'PATCH and DELETE'],
  11: ['s11-users', 'register, bcrypt, never return the password'],
  12: ['s12-jwt', 'login, sign a token, read it back'],
  13: ['s13-auth-middleware', 'Bearer tokens, 401, 403, ownership'],
  14: ['s14-refresh-token', 'two tokens, rotation, revocation'],
  15: ['s15-rate-limit', '429 before the handler runs'],
  16: ['s16-cors', 'the browser asks permission first'],
  17: ['s17-cache', 'a fast answer, and a stale one'],
  18: ['s18-cache-invalidation', 'clear the cache when data changes'],
  19: ['s19-config', 'every environment read, in one file'],
  20: ['s20-swagger', 'the API documents itself'],
  21: ['s21-tests', 'supertest, app.js, a green run'],
};

const CONCEPT = 'http://localhost:5173/concepts/step.html';

const arg = process.argv[2];

if (!arg) {
  console.log('\n  npm run step <n>\n');
  for (const [n, [branch, note]] of Object.entries(STEPS)) {
    console.log(`  ${n.padStart(2)}  ${branch.padEnd(24)} ${note}`);
  }
  console.log('\n  the API and the concept tab keep running; only the branch changes.\n');
  process.exit(0);
}

const entry = STEPS[arg];
const branch = entry ? entry[0] : arg;

try {
  execSync(`git checkout ${branch}`, { stdio: 'inherit' });
} catch {
  console.error(`\n  no branch "${branch}". Run npm run step to see the list.\n`);
  process.exit(1);
}

console.log(`\n  STEP ${String(arg).padStart(2, '0')} — ${entry ? entry[1] : branch}`);
console.log(`  CONCEPT  ${CONCEPT}`);
console.log('  API      http://localhost:8000\n');

/* Open the concept tab once, and only if the concept server is up. */
const marker = '.git/.concept-tab-opened';
if (process.platform === 'darwin' && !fs.existsSync(marker)) {
  let up = false;
  try {
    up = execSync(`curl -s -o /dev/null -w "%{http_code}" ${CONCEPT}`).toString() === '200';
  } catch {
    up = false;
  }
  if (up) {
    execSync(`open "${CONCEPT}"`);
    fs.writeFileSync(marker, '1');
  }
}
