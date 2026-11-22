#!/usr/bin/env node
/**
 * npm run db
 *
 * Starts a real MongoDB on 127.0.0.1:27017 with an in-memory data directory.
 * Nothing is installed system-wide and nothing survives Ctrl-C — which is what
 * you want for a course. Use it when you want the database in its own terminal:
 *
 *   terminal 1: npm run db
 *   terminal 2: npm run seed && npm run api
 *
 * Have your own MongoDB? Skip this and set MONGODB_URI in .env.
 */
const { MongoMemoryServer } = await import('mongodb-memory-server');

let db;

try {
  db = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'shop' },
  });
  console.log('\n  MONGODB_URI=mongodb://127.0.0.1:27017/shop');
  console.log('  ready — Ctrl-C to stop (all data is lost)\n');
} catch (err) {
  if (/EADDRINUSE|already in use/i.test(err.message)) {
    console.log('\n  port 27017 already has MongoDB. Nothing to start.\n');
    process.exit(0);
  }
  console.error(err.message);
  process.exit(1);
}

async function stop() {
  await db.stop();
  process.exit(0);
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
