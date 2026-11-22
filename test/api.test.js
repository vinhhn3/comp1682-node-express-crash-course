process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cache = require('memory-cache');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let Product;
let User;
let mongo;

const PASSWORD = 'password123';

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri('shop_test'));

  Product = require('../src/models/product');
  User = require('../src/models/user');
  app = require('../src/app');
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
  await User.deleteMany({});
  cache.clear();
});

async function makeUser(username, role = 'user') {
  return User.create({
    username,
    password: await bcrypt.hash(PASSWORD, 10),
    role,
  });
}

async function login(username, password = PASSWORD) {
  return request(app).post('/users/login').send({ username, password });
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

test('GET /health answers without a token', async () => {
  const res = await request(app).get('/health');

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(typeof res.body.uptime, 'number');
});

test('GET /products returns id, not _id, and caches the second read', async () => {
  await Product.create([
    { title: 'Aero Mug', category: 'Kitchen', price: 24 },
    { title: 'Fern Pot', category: 'Home', price: 32 },
  ]);

  const first = await request(app).get('/products');

  assert.equal(first.status, 200);
  assert.equal(first.body.length, 2);
  assert.equal(first.headers['x-total-count'], '2');
  assert.equal(first.headers['x-cache'], 'MISS');
  assert.equal(typeof first.body[0].id, 'string');
  assert.equal(first.body[0]._id, undefined);

  const second = await request(app).get('/products');
  assert.equal(second.headers['x-cache'], 'HIT');
});

test('POST /products without a token is 401', async () => {
  const res = await request(app)
    .post('/products')
    .send({ title: 'Desk Mat', category: 'Desk', price: 29 });

  assert.equal(res.status, 401);
  assert.equal(res.body.error.status, 401);
});

test('register creates a user without leaking the password', async () => {
  const created = await request(app)
    .post('/users/register')
    .send({ username: 'sam', password: PASSWORD });

  assert.equal(created.status, 201);
  assert.equal(created.body.username, 'sam');
  assert.equal(created.body.role, 'user');
  assert.equal(created.body.password, undefined);
  assert.equal(typeof created.body.id, 'string');

  const duplicate = await request(app)
    .post('/users/register')
    .send({ username: 'sam', password: PASSWORD });

  assert.equal(duplicate.status, 409);
});

test('login rejects a wrong password and returns two tokens for the right one', async () => {
  await makeUser('sam');

  const wrong = await login('sam', 'not-the-password');
  assert.equal(wrong.status, 401);

  const right = await login('sam');
  assert.equal(right.status, 200);
  assert.equal(typeof right.body.accessToken, 'string');
  assert.equal(typeof right.body.refreshToken, 'string');
  assert.equal(right.body.user.username, 'sam');
});

test('POST /products validates the body and records createdBy', async () => {
  const user = await makeUser('sam');
  const session = await login('sam');
  const token = session.body.accessToken;

  const invalid = await request(app)
    .post('/products')
    .set(auth(token))
    .send({ category: 'Desk', price: 29 });

  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.details[0].field, 'title');

  const created = await request(app)
    .post('/products')
    .set(auth(token))
    .send({ title: 'Desk Mat', category: 'Desk', price: 29 });

  assert.equal(created.status, 201);
  assert.equal(created.body.createdBy, user.id);
});

test('only the owner or an admin may edit a product', async () => {
  await makeUser('admin', 'admin');
  await makeUser('demo');

  const adminToken = (await login('admin')).body.accessToken;
  const demoToken = (await login('demo')).body.accessToken;

  const created = await request(app)
    .post('/products')
    .set(auth(adminToken))
    .send({ title: 'Admin Product', category: 'Home', price: 10 });

  const denied = await request(app)
    .patch(`/products/${created.body.id}`)
    .set(auth(demoToken))
    .send({ price: 11 });

  assert.equal(denied.status, 403);

  const own = await request(app)
    .post('/products')
    .set(auth(demoToken))
    .send({ title: 'Demo Product', category: 'Home', price: 12 });

  const ownUpdate = await request(app)
    .patch(`/products/${own.body.id}`)
    .set(auth(demoToken))
    .send({ price: 13 });

  assert.equal(ownUpdate.status, 200);
  assert.equal(ownUpdate.body.price, 13);

  const adminEdit = await request(app)
    .patch(`/products/${own.body.id}`)
    .set(auth(adminToken))
    .send({ price: 14 });

  assert.equal(adminEdit.status, 200);
});

test('only an admin may delete, and the next read is a 404', async () => {
  await makeUser('admin', 'admin');
  await makeUser('demo');

  const adminToken = (await login('admin')).body.accessToken;
  const demoToken = (await login('demo')).body.accessToken;

  const created = await request(app)
    .post('/products')
    .set(auth(adminToken))
    .send({ title: 'Delete Me', category: 'Home', price: 10 });

  const denied = await request(app)
    .delete(`/products/${created.body.id}`)
    .set(auth(demoToken));

  assert.equal(denied.status, 403);

  const deleted = await request(app)
    .delete(`/products/${created.body.id}`)
    .set(auth(adminToken));

  assert.equal(deleted.status, 204);

  const gone = await request(app).get(`/products/${created.body.id}`);
  assert.equal(gone.status, 404);
});

test('unknown routes use the same error shape', async () => {
  const res = await request(app).get('/nope');

  assert.equal(res.status, 404);
  assert.equal(res.body.error.status, 404);
  assert.match(res.body.error.message, /not found/i);
});

test('a refresh token rotates and a reused one is refused', async () => {
  await makeUser('demo');

  const session = await login('demo');
  const firstRefresh = session.body.refreshToken;

  const rotated = await request(app)
    .post('/users/refresh')
    .send({ refreshToken: firstRefresh });

  assert.equal(rotated.status, 200);
  assert.notEqual(rotated.body.refreshToken, firstRefresh);

  const reused = await request(app)
    .post('/users/refresh')
    .send({ refreshToken: firstRefresh });

  assert.equal(reused.status, 401);

  const loggedOut = await request(app)
    .post('/users/logout')
    .set(auth(session.body.accessToken));

  assert.equal(loggedOut.status, 204);

  const afterLogout = await request(app)
    .post('/users/refresh')
    .send({ refreshToken: rotated.body.refreshToken });

  assert.equal(afterLogout.status, 401);
});
