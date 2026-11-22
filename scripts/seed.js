#!/usr/bin/env node
/**
 * Seed the shop with the same six products the React course uses, plus two users.
 *
 *   npm run seed              wipe and insert
 *   npm run seed -- --if-empty   insert only when the products collection is empty
 *
 * The in-memory MongoDB from `npm run dev` starts empty, so this is how the
 * course gets something to look at. In a real project this would be a fixture,
 * a migration, or a one-off admin script — the shape is the same.
 */
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ROOT = path.join(__dirname, '..');
const productModel = path.join(ROOT, 'src/models/product.js');
const userModel = path.join(ROOT, 'src/models/user.js');

if (!fs.existsSync(productModel)) {
  console.error('\n  No src/models/product.js yet — the model arrives at step 8.\n');
  process.exit(1);
}

const Product = require(productModel);
const User = fs.existsSync(userModel) ? require(userModel) : null;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shop';
const ifEmpty = process.argv.includes('--if-empty');

const PRODUCTS = [
  { title: 'Aero Mug', category: 'Kitchen', price: 24, description: 'A thin-walled mug that keeps coffee warm for an hour.', stock: 40 },
  { title: 'Halo Headphones', category: 'Audio', price: 89, description: 'Closed-back headphones with a detachable cable.', stock: 12 },
  { title: 'Fern Pot', category: 'Home', price: 32, description: 'Glazed stoneware pot with a drainage tray.', stock: 25 },
  { title: 'Slate Keyboard', category: 'Desk', price: 129, description: 'Tenkeyless mechanical keyboard, quiet switches.', stock: 8 },
  { title: 'Ember Candle', category: 'Home', price: 18, description: 'Soy candle, cedar and smoke, 40 hour burn.', stock: 60 },
  { title: 'Field Backpack', category: 'Travel', price: 74, description: 'Waxed canvas, 22 litres, laptop sleeve.', stock: 15 },
];

const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'demo', password: 'demo1234', role: 'user' },
];

async function main() {
  await mongoose.connect(MONGODB_URI);

  if (ifEmpty) {
    const count = await Product.estimatedDocumentCount();
    if (count > 0) {
      console.log(`  seed skipped: ${count} products already there`);
      await mongoose.disconnect();
      return;
    }
  }

  await Product.deleteMany({});
  if (User) await User.deleteMany({});

  let admin = null;
  if (User) {
    const docs = [];
    for (const user of USERS) {
      docs.push({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      });
    }
    const created = await User.create(docs);
    admin = created.find((u) => u.role === 'admin');
    console.log(`  users:    ${USERS.map((u) => `${u.username}/${u.password}`).join(', ')}`);
  }

  const products = PRODUCTS.map((p) => (admin ? { ...p, createdBy: admin._id } : p));
  await Product.insertMany(products);

  console.log(`  products: ${products.length} inserted`);
  console.log(`  database: ${MONGODB_URI}\n`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(`\n  seed failed: ${err.message}\n`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
