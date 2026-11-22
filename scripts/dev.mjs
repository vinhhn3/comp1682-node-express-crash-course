#!/usr/bin/env node
/**
 * One command for the whole loop: database, seed data, API, reload on save.
 *
 *   npm run dev
 *
 * If the app has no Mongoose model yet (steps 0–7), it simply runs nodemon.
 * From step 8 it starts a real MongoDB in memory on 127.0.0.1:27017, seeds it
 * once, then runs nodemon. The first run downloads the MongoDB binary (~60 MB).
 *
 * Have your own MongoDB? Set MONGODB_URI and this script will not start one.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const NODEMON = path.join(ROOT, 'node_modules/nodemon/bin/nodemon.js');
const needsDb = fs.existsSync(path.join(ROOT, 'src/config/database.js'));
const canSeed = fs.existsSync(path.join(ROOT, 'src/models/product.js'));

const env = { ...process.env };
let memoryDb = null;

function run(cmd, args, extraEnv = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...env, ...extraEnv },
    });
    child.on('exit', (code) => resolve(code));
  });
}

if (needsDb && !env.MONGODB_URI) {
  process.stdout.write('\n  starting MongoDB in memory (first run downloads it)…\n');

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryDb = await MongoMemoryServer.create({
      instance: { port: 27017, dbName: 'shop' },
    });
    env.MONGODB_URI = 'mongodb://127.0.0.1:27017/shop';
    console.log(`  MongoDB ready at ${env.MONGODB_URI}\n`);

    if (canSeed) {
      const seedCode = await run(process.execPath, ['scripts/seed.js', '--if-empty'], {
        MONGODB_URI: env.MONGODB_URI,
      });
      if (seedCode !== 0) console.warn('\n  seed skipped or failed — the API still starts\n');
    }
  } catch (err) {
    if (/EADDRINUSE|already in use/i.test(err.message)) {
      env.MONGODB_URI = 'mongodb://127.0.0.1:27017/shop';
      console.log('  port 27017 is already serving MongoDB — using it\n');
    } else {
      console.error(`\n  could not start the in-memory database:\n  ${err.message}\n`);
      console.error('  Set MONGODB_URI to your own MongoDB, or run: npm run db\n');
      process.exit(1);
    }
  }
}

const api = spawn(process.execPath, [NODEMON, 'server.js'], {
  cwd: ROOT,
  stdio: 'inherit',
  env,
});

async function stop(code = 0) {
  api.kill('SIGINT');
  if (memoryDb) await memoryDb.stop();
  process.exit(code);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
api.on('exit', (code) => stop(code ?? 0));
