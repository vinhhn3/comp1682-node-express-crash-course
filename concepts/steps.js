/* One entry per step. The concept page reads the current git branch and renders
   the matching entry, so `npm run step 9` changes the code AND the concept. */

export const LAST_STEP = 21;

/* One sequence per step, rendered right after the intro. Plain words only. */
export const STEP_SEQUENCES = {
  0: ['raw'],
  1: ['raw'],
  2: ['route'],
  3: ['body'],
  4: ['route'],
  5: ['controller'],
  6: ['repository'],
  7: ['boot'],
  8: ['read'],
  9: ['error'],
  10: ['update'],
  11: ['register'],
  12: ['login'],
  13: ['create'],
  14: ['refresh', 'reuse'],
  15: ['limit'],
  16: ['preflight'],
  17: ['cachedRead'],
  18: ['writeInvalidate'],
  19: ['bootConfig'],
  20: ['docs'],
  21: ['test'],
};

export const STEPS = {
  0: {
    branch: 's00-raw-http',
    title: 'A server is a function',
    line: 'Node hands you a request and a response. Everything else is what you make of them.',
    changed: [
      'http.createServer takes one function',
      'the function runs for every request: method, URL, headers, body',
      'this route answers /products and nothing else',
    ],
    code: {
      file: 'server.js',
      text: `const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/products') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(products));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});`,
    },
    ask: 'Where does the 200 come from? Where would you add a second route?',
    try: [
      { label: 'Ask for the product list', method: 'GET', path: '/products' },
      { label: 'Ask for something that is not there', method: 'GET', path: '/nope', expect: 404 },
    ],
  },

  1: {
    branch: 's01-express',
    title: 'Express is a router and a queue',
    line: 'The same server, without the if-statements. A route is a method, a path and a function.',
    changed: [
      'express() creates the app',
      'app.get(path, handler) is a route',
      'res.json sets the status and the content type for you',
    ],
    code: {
      file: 'server.js',
      text: `const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/products', (req, res) => {
  res.json(products);
});`,
    },
    ask: 'What did Express remove? What is still your job?',
    try: [
      { label: 'The health check', method: 'GET', path: '/health' },
      { label: 'The product list', method: 'GET', path: '/products' },
    ],
  },

  2: {
    branch: 's02-one-file',
    title: 'A second route needs an ID',
    line: 'Data, routes and the 404 live in one file. The file is still readable — for now.',
    changed: [
      'GET /products/:id reads req.params',
      'a missing product is a 404, not an empty 200',
      'every route is still an inline function in server.js',
    ],
    code: {
      file: 'server.js',
      text: `app.get('/products/:id', (req, res) => {
  const product = products.find(
    (p) => String(p.id) === req.params.id,
  );

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});`,
    },
    ask: 'Now add POST. How many lines does server.js become?',
    try: [
      { label: 'One product by id', method: 'GET', path: '/products/{id}' },
      { label: 'An id that does not exist', method: 'GET', path: '/products/999', expect: 404 },
    ],
  },

  3: {
    branch: 's03-json-body',
    title: 'The body arrives as a stream',
    line: 'express.json reads it and gives you req.body. Everything after that is your rules.',
    changed: [
      'app.use(express.json()) parses JSON on every request',
      'POST /products pushes into the same array',
      'a hand-written check rejects a missing title or a string price',
    ],
    code: {
      file: 'server.js',
      text: `app.use(express.json());

app.post('/products', (req, res) => {
  const { title, category, price } = req.body;

  if (!title || !category || typeof price !== 'number') {
    return res.status(400).json({ error: 'title, category and a numeric price are required' });
  }

  const product = { id: nextId++, title, category, price };
  products.push(product);
  res.status(201).json(product);
});`,
    },
    ask: 'Send the price as a string. Who checked it? What else is unvalidated?',
    try: [
      {
        label: 'Create a product',
        method: 'POST',
        path: '/products',
        body: { title: 'Test Lamp', category: 'Home', price: 45 },
        expect: 201,
      },
      {
        label: 'Create one with a string price',
        method: 'POST',
        path: '/products',
        body: { title: 'Bad Lamp', category: 'Home', price: '45' },
        expect: 400,
      },
      { label: 'The list now has seven', method: 'GET', path: '/products' },
    ],
  },

  4: {
    branch: 's04-routers',
    title: 'The router owns the paths',
    line: 'express.Router is a route table you can mount. server.js becomes a list of mounts.',
    changed: [
      'src/routes/productRoutes.js appears',
      'server.js mounts it at /products',
      'the data and the handlers moved into the router',
    ],
    code: {
      file: 'src/routes/productRoutes.js',
      text: `const router = express.Router();

router.get('/', (req, res) => res.json(products));
router.get('/:id', (req, res) => { ... });
router.post('/', (req, res) => { ... });

module.exports = router;`,
    },
    ask: 'The router now owns the data too. Is that its job?',
    try: [{ label: 'The same URL, through a router', method: 'GET', path: '/products' }],
  },

  5: {
    branch: 's05-controllers',
    title: 'The controller owns the handler',
    line: 'The route file becomes a table of contents: URL on the left, function on the right.',
    changed: [
      'src/controllers/productController.js appears',
      'each handler is a named export, not an inline function',
      'the router is six lines: path, verb, controller',
    ],
    code: {
      file: 'src/routes/productRoutes.js',
      text: `router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', productController.create);`,
    },
    ask: 'The controller owns the array now. Who should?',
    try: [
      { label: 'List', method: 'GET', path: '/products' },
      {
        label: 'Create',
        method: 'POST',
        path: '/products',
        body: { title: 'Desk Mat', category: 'Desk', price: 29 },
        expect: 201,
      },
    ],
  },

  6: {
    branch: 's06-repositories',
    title: 'The repository owns the data',
    line: 'The controller asks for products. It does not know whether they live in an array or a database.',
    changed: [
      'src/repositories/productRepository.js appears',
      'findAll, findById and create — three methods',
      'the controller is unchanged in shape, only async now',
    ],
    code: {
      file: 'src/repositories/productRepository.js',
      text: `class ProductRepository {
  async findAll() {
    return products;
  }

  async findById(id) {
    return products.find((p) => String(p.id) === String(id));
  }
}

module.exports = new ProductRepository();`,
    },
    ask: 'Swap the array for a database. Which files change?',
    try: [{ label: 'The controller has not noticed', method: 'GET', path: '/products' }],
  },

  7: {
    branch: 's07-mongo-connect',
    title: 'Connect once, before you listen',
    line: 'The database is a dependency. Open it at boot, and stop if it is not there.',
    changed: [
      'mongoose and dotenv join the project',
      'src/config/database.js owns the connection string',
      'a failed connection logs and exits — the server never half-starts',
    ],
    code: {
      file: 'src/config/database.js',
      text: `async function connectToDatabase() {
  try {
    await mongoose.connect(uri);
    console.log(\`MongoDB connected: \${mongoose.connection.name}\`);
  } catch (err) {
    console.error(\`MongoDB connection failed: \${err.message}\`);
    process.exit(1);
  }
}`,
    },
    ask: 'The database is connected but unused. What is the smallest change that uses it?',
    try: [
      { label: 'Health still answers', method: 'GET', path: '/health' },
      { label: 'Products still come from the array', method: 'GET', path: '/products' },
    ],
  },

  8: {
    branch: 's08-model',
    title: 'A schema, and the swap',
    line: 'The model describes a product. The repository changes. The controller does not.',
    changed: [
      'src/models/product.js: fields, types, required, min, timestamps',
      'the repository queries Product instead of an array',
      'toJSON turns _id into id, so the client keeps one shape',
    ],
    code: {
      file: 'src/models/product.js',
      text: `const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
}, {
  timestamps: true,
  toJSON: {
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
});`,
    },
    ask: 'The controller did not change. What does that tell you about the boundary?',
    try: [
      { label: 'Now from MongoDB', method: 'GET', path: '/products' },
      { label: 'Search, the React course way', method: 'GET', path: '/products?q=mug' },
      { label: 'One document', method: 'GET', path: '/products/{id}' },
    ],
  },

  9: {
    branch: 's09-errors',
    title: 'One shape for every failure',
    line: 'Throw anywhere. One handler turns the throw into a status code and JSON.',
    changed: [
      'AppError carries a status; asyncHandler forwards rejected promises',
      'zod checks the body before the controller sees it',
      'Mongoose errors map to 400 and 409; unknown routes become 404',
    ],
    code: {
      file: 'src/middlewares/errorMiddleware.js',
      text: `function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  if (status >= 500) console.error(err);

  res.status(status).json({
    error: {
      message: err.message || 'Something went wrong',
      status,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}`,
    },
    ask: 'Delete the asyncHandler from one route. What does the client see when Mongo throws?',
    try: [
      {
        label: 'A body with no title',
        method: 'POST',
        path: '/products',
        body: { category: 'Home', price: 10 },
        expect: 400,
      },
      {
        label: 'A price below zero',
        method: 'POST',
        path: '/products',
        body: { title: 'Bad', category: 'Home', price: -1 },
        expect: 400,
      },
      { label: 'An id Mongo cannot parse', method: 'GET', path: '/products/not-an-id', expect: 400 },
      { label: 'A route that does not exist', method: 'GET', path: '/nope', expect: 404 },
      { label: 'A product that does not exist', method: 'GET', path: '/products/000000000000000000000000', expect: 404 },
    ],
  },

  10: {
    branch: 's10-update-delete',
    title: 'Update and delete',
    line: 'The last two verbs. PATCH sends only the fields that changed; DELETE answers with no body.',
    changed: [
      'PATCH /products/:id with a partial schema',
      'findByIdAndUpdate uses new and runValidators',
      'DELETE /products/:id answers 204, or 404 if it was already gone',
    ],
    code: {
      file: 'src/repositories/productRepository.js',
      text: `async updateById(id, data) {
  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async deleteById(id) {
  return Product.findByIdAndDelete(id);
}`,
    },
    ask: 'Anyone can delete any product. What is missing, and where does it belong?',
    try: [
      {
        label: 'Change one price',
        method: 'PATCH',
        path: '/products/{id}',
        body: { price: 19.5 },
      },
      {
        label: 'Delete a product',
        method: 'DELETE',
        path: '/products/{lastId}',
        expect: 204,
      },
      { label: 'Ask for it again', method: 'GET', path: '/products/{lastId}', expect: 404 },
    ],
  },

  11: {
    branch: 's11-users',
    title: 'A user is a document too',
    line: 'Hash the password before it is stored. The hash never travels back out.',
    changed: [
      'src/models/user.js: unique username, role, password select: false',
      'bcrypt.hash in the controller; 409 when the username exists',
      'the response returns id, username, role — never the hash',
    ],
    code: {
      file: 'src/controllers/userController.js',
      text: `const hash = await bcrypt.hash(password, 10);

const user = await userRepository.create({
  username,
  password: hash,
});

res.status(201).json({
  id: user.id,
  username: user.username,
  role: user.role,
});`,
    },
    ask: 'The database now holds a hash. What must never travel back to the client?',
    try: [
      {
        label: 'Register a user',
        method: 'POST',
        path: '/users/register',
        body: { username: 'sam', password: 'sam12345' },
        expect: 201,
      },
      {
        label: 'Register the same name again',
        method: 'POST',
        path: '/users/register',
        body: { username: 'sam', password: 'sam12345' },
        expect: 409,
      },
    ],
  },

  12: {
    branch: 's12-jwt',
    title: 'A token is a signed claim',
    line: 'Login checks the hash, then signs a small JSON object. The signature is the proof.',
    changed: [
      'POST /users/login compares with bcrypt.compare',
      'jwt.sign puts id, username and role in the payload',
      'the same message for a missing user and a wrong password: invalid credentials',
    ],
    code: {
      file: 'src/controllers/userController.js',
      text: `const user = await userRepository.findByUsernameWithPassword(username);
const ok = user && (await bcrypt.compare(password, user.password));

if (!ok) throw new AppError('Invalid credentials', 401);

const accessToken = jwt.sign(
  { id: user.id, username: user.username, role: user.role },
  ACCESS_TOKEN_SECRET,
  { expiresIn: '15m' },
);`,
    },
    ask: 'Decode the token. Which of its three parts proves it was not edited?',
    try: [
      {
        label: 'Log in as admin',
        method: 'POST',
        path: '/users/login',
        body: { username: 'admin', password: 'admin123' },
        expect: 200,
      },
      {
        label: 'The same login, wrong password',
        method: 'POST',
        path: '/users/login',
        body: { username: 'admin', password: 'nope' },
        expect: 401,
      },
    ],
  },

  13: {
    branch: 's13-auth-middleware',
    title: 'Who are you, and may you?',
    line: 'A middleware reads the header before the handler runs. 401 means unknown; 403 means known and refused.',
    changed: [
      'requireAuth verifies the Bearer token and sets req.user',
      'POST and PATCH need a user; PATCH also checks the owner',
      'DELETE needs the admin role; GET stays public',
    ],
    code: {
      file: 'src/middlewares/authMiddleware.js',
      text: `function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Missing Bearer token', 401));
  }

  try {
    req.user = jwt.verify(token, ACCESS_TOKEN_SECRET);
    next();
  } catch {
    next(new AppError('Invalid token', 401));
  }
}`,
    },
    ask: 'A valid token for demo, a product owned by admin. Which status: 401 or 403?',
    try: [
      {
        label: 'Create with no token',
        method: 'POST',
        path: '/products',
        body: { title: 'No Auth', category: 'Home', price: 10 },
        expect: 401,
      },
      {
        label: 'Create as demo',
        method: 'POST',
        path: '/products',
        body: { title: 'Demo Product', category: 'Home', price: 12 },
        as: 'demo',
        expect: 201,
      },
      {
        label: 'Demo deletes it: owner, not admin',
        method: 'DELETE',
        path: '/products/{lastId}',
        as: 'demo',
        expect: 403,
      },
      {
        label: 'Admin deletes it',
        method: 'DELETE',
        path: '/products/{lastId}',
        as: 'admin',
        expect: 204,
      },
    ],
  },

  14: {
    branch: 's14-refresh-token',
    title: 'Two tokens, two lifetimes',
    line: 'The access token is short and cheap. The refresh token is long, stored as a hash, and rotated.',
    changed: [
      'login signs 15 minutes of access and 7 days of refresh',
      'the refresh token hash is stored on the user, so it can be revoked',
      'POST /users/refresh issues a new pair and kills the old refresh token',
    ],
    code: {
      file: 'src/controllers/userController.js',
      text: `const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
  expiresIn: '15m',
});

const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
  expiresIn: '7d',
});

await userRepository.setRefreshTokenHash(
  user.id,
  sha256(refreshToken),
);`,
    },
    ask: 'Use the old refresh token after a rotation. Why is it refused?',
    try: [
      {
        label: 'Rotate a refresh token',
        method: 'POST',
        path: '/users/refresh',
        note: 'logs in as demo first, then spends its refresh token',
        expect: 200,
      },
      {
        label: 'A refresh token that is not a JWT',
        method: 'POST',
        path: '/users/refresh',
        body: { refreshToken: 'not-a-token' },
        expect: 401,
      },
    ],
  },

  15: {
    branch: 's15-rate-limit',
    title: 'Say no before the handler',
    line: 'A limiter is middleware that counts. When the count is gone, the request stops at the door.',
    changed: [
      '100 requests a minute per IP on the whole API',
      '5 login attempts a minute — the brute-force door',
      'a 429 with RateLimit-* headers, and no controller code',
    ],
    code: {
      file: 'src/middlewares/rateLimitMiddleware.js',
      text: `const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  message: {
    error: { message: 'Too many requests', status: 429 },
  },
});`,
    },
    ask: 'Which runs first: the limiter or the auth check? Why does the order matter?',
    try: [
      {
        label: 'Six bad logins, one after another',
        method: 'POST',
        path: '/users/login',
        body: { username: 'demo', password: 'wrong' },
        repeat: 6,
        note: 'five 401s, then 429',
      },
    ],
  },

  16: {
    branch: 's16-cors',
    title: 'The browser asks permission first',
    line: 'CORS is a response header, checked by the browser, for a different origin. curl never asks.',
    changed: [
      'an allowlist from CORS_ORIGINS, defaulting to the concept tab',
      'preflight OPTIONS is answered before your routes',
      'an unknown Origin gets 403 and no Access-Control-Allow-Origin',
    ],
    code: {
      file: 'server.js',
      text: `app.use(cors({
  origin(origin, callback) {
    if (!origin || allowed.includes(origin)) {
      return callback(null, true);
    }
    callback(new AppError(\`Origin \${origin} is not allowed\`, 403));
  },
  credentials: true,
}));`,
    },
    ask: 'curl sends no Origin header. Why does it still work?',
    try: [
      {
        label: 'An allowed origin',
        method: 'GET',
        path: '/products',
        headers: { Origin: 'http://localhost:5173' },
        note: 'look for access-control-allow-origin in the headers',
      },
      {
        label: 'An origin that is not on the list',
        method: 'GET',
        path: '/products',
        headers: { Origin: 'https://evil.example' },
        expect: 403,
      },
    ],
  },

  17: {
    branch: 's17-cache',
    title: 'A fast answer, and a stale one',
    line: 'Cache the GET by URL. The second request never reaches Mongo — which is the point, and the problem.',
    changed: [
      'memory-cache in front of GET /products',
      'X-Cache says HIT or MISS on every response',
      'a write does not touch the cache yet',
    ],
    code: {
      file: 'src/middlewares/cacheMiddleware.js',
      text: `const hit = cache.get(key);
if (hit) {
  res.set('X-Cache', 'HIT');
  return res.json(hit);
}

const originalJson = res.json.bind(res);
res.json = (body) => {
  cache.put(key, body, seconds * 1000);
  return originalJson(body);
};`,
    },
    ask: 'Create a product, then fetch the list. How long is the list wrong?',
    try: [
      { label: 'First read', method: 'GET', path: '/products', note: 'X-Cache: MISS' },
      { label: 'Second read', method: 'GET', path: '/products', note: 'X-Cache: HIT' },
      {
        label: 'Create a product',
        method: 'POST',
        path: '/products',
        body: { title: 'Cache Test', category: 'Desk', price: 5 },
        as: 'admin',
        expect: 201,
      },
      { label: 'Read again — is it there?', method: 'GET', path: '/products', note: 'HIT, and stale' },
    ],
  },

  18: {
    branch: 's18-cache-invalidation',
    title: 'The writer clears the cache',
    line: 'A cache is correct only if every write invalidates it. The reader cannot fix this.',
    changed: [
      'the write routes run clearCache before the controller',
      'the next GET is a MISS and sees the new data',
      'blanket clear is correct; a key prefix is the optimisation',
    ],
    code: {
      file: 'src/routes/productRoutes.js',
      text: `router.post(
  '/',
  requireAuth,
  validate(createProductSchema),
  clearCache,
  productController.create,
);`,
    },
    ask: 'cache.clear() clears every URL. When is that too blunt, and what would you key on?',
    try: [
      {
        label: 'Create a product',
        method: 'POST',
        path: '/products',
        body: { title: 'Fresh Product', category: 'Desk', price: 7 },
        as: 'admin',
        expect: 201,
      },
      {
        label: 'Read the list',
        method: 'GET',
        path: '/products',
        note: 'MISS, and the new product is in it',
      },
    ],
  },

  19: {
    branch: 's19-config',
    title: 'One file reads the environment',
    line: 'Every process.env read moves to config. Every other module asks config, and boot refuses fake production secrets.',
    changed: [
      'src/config/index.js holds port, Mongo URI, secrets, TTLs and origins',
      'dotenv is loaded once, in that file',
      'production refuses to start with the development secrets',
    ],
    code: {
      file: 'src/config/index.js',
      text: `require('dotenv').config();

const config = {
  port: Number(process.env.PORT || 8000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shop',
  accessSecret: process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret',
  accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  corsOrigins: (process.env.CORS_ORIGINS || '').split(','),
};

if (config.nodeEnv === 'production' && config.accessSecret.startsWith('dev-')) {
  throw new Error('Set ACCESS_TOKEN_SECRET before running in production');
}`,
    },
    ask: 'Run grep -rn "process.env" src. How many answers before and after?',
    try: [{ label: 'Still healthy', method: 'GET', path: '/health' }],
  },

  20: {
    branch: 's20-swagger',
    title: 'The docs live next to the route',
    line: 'A comment above the route becomes OpenAPI. The UI is one mount, and it cannot drift far.',
    changed: [
      'swagger-jsdoc reads JSDoc from src/routes',
      '/api-docs is the UI; /api-docs.json is the document',
      'the bearer scheme is declared once, next to the product schema',
    ],
    code: {
      file: 'src/routes/productRoutes.js',
      text: `/**
 * @openapi
 * /products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: An array of products
 */`,
    },
    ask: 'The docs are a comment. What happens when the route changes and the comment does not?',
    press: { href: 'http://localhost:8000/api-docs', label: 'Open Swagger UI' },
    try: [{ label: 'Read the generated document', method: 'GET', path: '/api-docs.json' }],
  },

  21: {
    branch: 's21-tests',
    title: 'The app without a port',
    line: 'Move the app into its own module. Now a test can import it, call it, and never bind a port.',
    changed: [
      'src/app.js builds the app; server.js only connects and listens',
      'node:test + supertest hit the app in-process',
      'an in-memory MongoDB, ten tests, no network',
    ],
    code: {
      file: 'test/api.test.js',
      text: `const res = await request(app)
  .post('/products')
  .set('Authorization', \`Bearer \${adminToken}\`)
  .send({ title: 'Test', category: 'Desk', price: 10 });

assert.equal(res.status, 201);
assert.equal(res.body.title, 'Test');`,
    },
    ask: 'The app never calls listen in a test. Why is that the point?',
  },
};

/* The in-depth explanation for each step, rendered on the step page itself so
   nobody has to leave the tab. Blocks are plain objects: p, h, ul, note, table,
   code, compare, flow, seq, tree. */

export const EXPLAIN = {
  0: [
    {
      type: 'p',
      html: `An HTTP request has five parts: a method, a path, headers, an optional body, and the protocol version. A response has three: a status, headers, and an optional body. Node's <code>http</code> module hands you the request and lets you write the response yourself.`,
    },
    {
      type: 'ul',
      items: [
        'The method and path decide which branch of your code runs.',
        'Headers are metadata: <code>Content-Type</code>, <code>Authorization</code>, caching.',
        'The body is a stream, not a string, until somebody reads it.',
      ],
    },
    {
      type: 'flow',
      hops: [
        { at: 'Browser', data: 'GET /products', note: 'method + path + headers' },
        { at: 'node callback', data: 'req.method · req.url · req.headers', note: 'one function for every request' },
        { at: 'your branch', data: 'if (GET && /products)', note: 'the entire router' },
        { at: 'response', data: '200 · Content-Type: application/json · [ … ]', note: 'you write every part' },
      ],
    },
    {
      type: 'note',
      html: `The <code>200</code> is not automatic. Forget <code>res.end()</code> and the request hangs until the client gives up. That is the whole failure mode of raw Node.`,
    },
  ],

  1: [
    {
      type: 'p',
      html: `Express is two things: a router (method + path → function) and a queue of middleware. Every <code>app.use</code> and every route handler is a function with <code>(req, res, next)</code>. The router matches, the queue runs, the first function that writes a response ends the trip.`,
    },
    {
      type: 'compare',
      left: {
        label: 'raw node — step 0',
        text: `if (req.method === 'GET' && req.url === '/products') {
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(products));
} else {
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}`,
      },
      right: {
        label: 'express — step 1',
        text: `app.get('/products', (req, res) => {
  res.json(products);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});`,
      },
    },
    {
      type: 'note',
      html: `<code>res.json</code> sets the content type and serialises; <code>res.status</code> sets the code. Neither sends anything until <code>.json()</code> or <code>.end()</code> is called.`,
    },
  ],

  2: [
    {
      type: 'p',
      html: `The route table is real now, but the data, the handlers and the 404 still live in one file. That is fine for three routes. It stops being fine when the file is 300 lines and two people edit it.`,
    },
    {
      type: 'table',
      head: ['What is in server.js', 'Is it routing?', 'Where it belongs'],
      rows: [
        ['<code>GET /products</code>, <code>GET /products/:id</code>', 'yes', 'a route file'],
        ['<code>products</code> and <code>nextId</code>', 'no', 'a repository'],
        ['the lookup and the 404', 'no', 'a controller'],
        ['the JSON body rules (next step)', 'no', 'validation'],
      ],
    },
    {
      type: 'note',
      html: 'The URL is a routing fact. The lookup is a data fact. They are already tangled, and every new verb adds another tangle.',
    },
  ],

  3: [
    {
      type: 'p',
      html: `The body arrives in chunks over the socket. <code>express.json()</code> collects them and parses the JSON before your handler runs, so <code>req.body</code> exists. Without it, <code>req.body</code> is <code>undefined</code> and the first property read throws.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'socket', data: '{"title":"Test Lamp","price":45}', note: 'bytes, in one or more chunks' },
        { at: 'express.json()', data: 'collect · parse · set req.body', note: 'a middleware, not a route' },
        { at: 'your handler', data: 'req.body = { title, category, price }', note: 'now it is an object' },
        { at: 'your checks', data: 'typeof price === "number"', note: 'hand-written, one field at a time' },
        { at: 'response', data: '201 + product  /  400 + message', note: 'two exits' },
      ],
    },
    {
      type: 'note',
      html: `This check already has three jobs: required fields, types, and silently ignoring unknown fields. Step 9 replaces it with a schema and a reusable middleware.`,
    },
  ],

  4: [
    {
      type: 'p',
      html: `A router is a mini-app with its own paths. <code>server.js</code> mounts it at <code>/products</code>, so the router's <code>'/'</code> is the API's <code>/products</code>. That is the first real boundary: the URL lives in the router, not in the entry file.`,
    },
    {
      type: 'tree',
      rows: [
        ['server.js', 'creates the app, mounts the router, listens'],
        ['src/routes/productRoutes.js', 'GET /, GET /:id, POST / — and, for now, the data'],
      ],
    },
    {
      type: 'table',
      head: ['Layer', 'Knows', 'Must not know'],
      rows: [
        ['<code>server.js</code>', 'the port, the mounts, the order', 'product rules, status codes'],
        ['<code>routes/</code>', 'URLs, verbs, which handler answers', 'how products are stored or shaped'],
      ],
    },
    {
      type: 'note',
      html: 'Notice what moved with the router: the array. The boundary is not clean yet. Steps 5 and 6 move the work out, one layer at a time.',
    },
  ],

  5: [
    {
      type: 'p',
      html: `A controller owns the HTTP conversation: read the request, choose a status, send JSON. The router should only say which controller answers which URL. That is the difference between a route file and a controller file.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'router', data: 'router.get("/", getAll)', note: 'path + verb + function name' },
        { at: 'controller', data: 'getAll(req, res)', note: 'reads req, writes res' },
        { at: 'data', data: 'products array', note: 'still in the controller — the next smell' },
        { at: 'response', data: '200 + JSON', note: 'a status the controller owns' },
      ],
    },
    {
      type: 'note',
      html: 'The route file is now a table of contents: six lines, no logic. The controller is clean about HTTP, but it is still doing storage. Step 6 separates those.',
    },
  ],

  6: [
    {
      type: 'p',
      html: `A repository is the only code that knows how data is stored. It takes plain values and returns plain documents. The controller asks for products; it does not know whether the answer comes from an array, a file or a database.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'controller', data: 'productRepository.findAll()', note: 'no array in sight' },
        { at: 'repository', data: 'findAll() → products', note: 'today: an array in this file' },
        { at: 'return', data: '[ { id, title, … } ]', note: 'plain objects' },
        { at: 'controller', data: 'res.json(products)', note: 'it only formats the answer' },
      ],
    },
    {
      type: 'table',
      head: ['Layer', 'May use', 'Must not use'],
      rows: [
        ['<code>controllers/</code>', '<code>req</code>, <code>res</code>, repository methods', 'the array, Mongoose, a query'],
        ['<code>repositories/</code>', 'the data source', '<code>req</code>, <code>res</code>, status codes'],
      ],
    },
    {
      type: 'note',
      html: 'This boundary pays off at step 8: replace the array with Mongoose and the controller does not change a single line.',
    },
  ],

  7: [
    {
      type: 'p',
      html: `The database is an external dependency. Connect once at boot, before <code>listen</code>. If it fails, exit: a server that answers requests with a broken database is worse than a server that is clearly down.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'server.js', data: 'start()', note: 'one entry point' },
        { at: 'config/database.js', data: 'connectToDatabase()', note: 'the only file that knows the URI' },
        { at: 'mongoose', data: 'mongoose.connect(MONGODB_URI)', note: 'a connection pool, opened once' },
        { at: 'MongoDB', data: 'connected', note: 'then, and only then, app.listen' },
        { at: 'failure', data: 'log + process.exit(1)', note: 'fail fast, not half-alive' },
      ],
    },
    {
      type: 'note',
      html: `<code>dotenv</code> loads <code>.env</code> into <code>process.env</code>. <code>MONGODB_URI</code> is the one value that changes between your laptop, a teammate's laptop and production.`,
    },
  ],

  8: [
    {
      type: 'p',
      html: `The model is the schema: field names, types, <code>required</code>, <code>min</code>, timestamps. The repository now speaks Mongoose. The controller is untouched — the boundary from step 6 just proved itself.`,
    },
        {
      type: 'table',
      head: ['Hop', 'What is there'],
      rows: [
        ['<code>req.query</code>', '{ q: "mug" } — strings, because URLs are text'],
        ['repository argument', '{ q: "mug" } — the controller has already chosen the shape'],
        ['Mongo query', '{ title: /mug/i } — built by the repository'],
        ['document', 'a Mongoose document with <code>_id</code>, timestamps and getters'],
        ['JSON', '<code>toJSON</code> maps <code>_id</code> → <code>id</code>, drops <code>__v</code>'],
      ],
    },
    {
      type: 'note',
      html: 'The client saw <code>id</code> when the data was an array. It still sees <code>id</code> now that it is a Mongo document. That consistency is a decision made in one place.',
    },
  ],

  9: [
    {
      type: 'p',
      html: `An error is data too. <code>AppError</code> carries a status; <code>asyncHandler</code> turns a rejected promise into <code>next(err)</code>; one four-argument handler maps every known error to the same JSON shape.`,
    },
        {
      type: 'table',
      head: ['Where it came from', 'Status', 'What the client gets'],
      rows: [
        ['zod, via <code>validate</code>', '400', '<code>details: [{ field, message }]</code>'],
        ['a bad ObjectId', '400', '“Invalid id: …”'],
        ['Mongoose <code>ValidationError</code>', '400', 'one message per field'],
        ['duplicate key <code>11000</code>', '409', '“Duplicate value for username”'],
        ['an unknown route', '404', '“Route GET /nope not found”'],
        ['anything unplanned', '500', 'a generic message; the stack stays in the log'],
      ],
    },
    {
      type: 'note',
      html: 'In Express 4, a rejected promise is not caught for you. Without <code>asyncHandler</code>, the client waits for the timeout while the process logs an unhandled rejection.',
    },
  ],

  10: [
    {
      type: 'p',
      html: `<code>PATCH</code> sends only the fields that changed. <code>PUT</code> would replace the whole document. The update schema is the create schema with <code>.partial()</code>, so a missing title is allowed — but a title that is present must still be valid.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'request', data: 'PATCH /products/:id  { "price": 19.5 }', note: 'one field' },
        { at: 'validate', data: 'updateProductSchema.partial()', note: 'the other fields are optional' },
        { at: 'controller', data: 'findById → owner check → updateById', note: '404 if it is gone' },
        { at: 'repository', data: 'findByIdAndUpdate(id, data, { new, runValidators })', note: 'Mongoose validates the update' },
        { at: 'response', data: '200 + the updated document', note: 'or 400 / 404' },
      ],
    },
    {
      type: 'note',
      html: '<code>DELETE</code> answers <code>204</code> with no body. A second <code>DELETE</code> is a <code>404</code>: the second client is not wrong, the resource is gone.',
    },
  ],

  11: [
    {
      type: 'p',
      html: `A user is a document with one special field. The password is hashed with bcrypt before it is stored. The model marks it <code>select: false</code>, so an ordinary query cannot return it, and the response only exposes <code>id</code>, <code>username</code> and <code>role</code>.`,
    },
        {
      type: 'note',
      html: 'A unique index plus the 11000 → 409 mapping is the real duplicate guard. The <code>findOne</code> is a friendly early check; two simultaneous registrations can both pass it, and the database is the one that decides.',
    },
  ],

  12: [
    {
      type: 'p',
      html: `A JWT is three base64url parts: a header (algorithm), a payload (claims), and a signature (HMAC of the first two with a secret). The payload is readable by anyone. The signature is the only thing that proves it was not edited.`,
    },
        {
      type: 'ul',
      items: [
        '<b>Access token</b> — 15 minutes, sent on every request.',
        '<b>Refresh token</b> — 7 days, sent only to <code>/users/refresh</code>.',
        'Never put a password, an email you would not show, or a secret in the payload.',
      ],
    },
    {
      type: 'note',
      html: 'A missing user and a wrong password return the same 401 and the same message. Any difference lets an attacker enumerate usernames. The same reasoning applies to the time the answer takes.',
    },
  ],

  13: [
    {
      type: 'p',
      html: `Authentication answers “who are you?” and uses <b>401</b>. Authorization answers “may you?” and uses <b>403</b>. The middleware verifies the token once, sets <code>req.user</code>, and the route decides which checks run.`,
    },
        {
      type: 'table',
      head: ['Request', 'Check', 'Status'],
      rows: [
        ['no <code>Authorization</code> header', 'requireAuth', '401'],
        ['a token with a bad signature', '<code>jwt.verify</code>', '401'],
        ['a valid token, expired', '<code>jwt.verify</code>', '401 (Token expired)'],
        ['demo edits a product owned by admin', 'owner check', '403'],
        ['demo deletes any product', '<code>requireRole("admin")</code>', '403'],
        ['admin deletes it', 'both checks', '204'],
      ],
    },
    {
      type: 'note',
      html: 'GET stays public. Writes need a token; DELETE needs the admin role. The whole policy is visible in one route file, which is the point of putting it there.',
    },
  ],

  14: [
    {
      type: 'p',
      html: `Two tokens, two lifetimes. The access token is cheap and short. The refresh token is long, stored as a hash so it can be revoked, and replaced on every use. Rotation turns a stolen refresh token into a single-use problem.`,
    },
            {
      type: 'note',
      html: 'The old refresh token is still a valid JWT: the signature checks out. It is refused because its hash no longer matches the one on the user. That is revocation without keeping a denylist of every token ever issued.',
    },
  ],

  15: [
    {
      type: 'p',
      html: `A limiter counts requests per IP in a time window and answers <code>429</code> before the handler. The login limiter is separate and stricter because that is the brute-force door. Neither controller knows the limiter exists.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'request', data: 'POST /users/login', note: 'the third attempt in a minute' },
        { at: 'global limiter', data: '100 requests / minute / IP', note: 'cheap, in memory' },
        { at: 'login limiter', data: '5 requests / minute / IP', note: 'only this route' },
        { at: 'auth → validate → handler', data: 'the normal stack', note: 'reached only if the count is left' },
        { at: 'over the limit', data: '429 + Retry-After', note: 'no bcrypt, no database, no handler' },
      ],
    },
    {
      type: 'note',
      html: 'Order matters. The limiter before auth makes a flood almost free. Auth before validation means an anonymous caller cannot probe your field names and rules with a stream of 400s.',
    },
  ],

  16: [
    {
      type: 'p',
      html: `CORS is enforced by the browser on the response. The server's job is to answer the preflight and add the allow headers. <code>curl</code> never asks, which is why a “CORS error” is a browser symptom, not a server outage.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'page :5173', data: 'fetch("http://localhost:8000/products")', note: 'a different origin: scheme + host + port' },
        { at: 'browser', data: 'OPTIONS /products', note: 'preflight, because JSON or Authorization is not simple' },
        { at: 'API :8000', data: '204 + Access-Control-Allow-Origin: http://localhost:5173', note: 'plus methods and headers' },
        { at: 'browser', data: 'the real GET / POST', note: 'sent only after the preflight says yes' },
        { at: 'page', data: 'the body, or a network error', note: 'the server answered either way' },
      ],
    },
    {
      type: 'table',
      head: ['Header', 'Answers'],
      rows: [
        ['<code>Access-Control-Allow-Origin</code>', 'which page may read this response?'],
        ['<code>Access-Control-Allow-Methods</code>', 'which verbs the preflight may use'],
        ['<code>Access-Control-Allow-Headers</code>', 'which request headers are allowed'],
        ['<code>Access-Control-Allow-Credentials</code>', 'may the browser attach cookies?'],
      ],
    },
    {
      type: 'note',
      html: 'An allowlist needs the exact origin. <code>http://localhost:5173</code> and <code>http://127.0.0.1:5173</code> are different origins, and <code>*</code> is not allowed with credentials.',
    },
  ],

  17: [
    {
      type: 'p',
      html: `The cache is middleware in front of the controller, keyed by URL. A HIT never touches Mongo. It is fast, and for 60 seconds after a write it is wrong. That is not a bug in the cache; it is a missing invalidation.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'GET /products', data: 'the first request', note: 'cache.get(key) → nothing' },
        { at: 'MISS', data: 'controller → repository → MongoDB', note: 'the normal path' },
        { at: 'cache.put', data: '[ … ] for 60 seconds', note: 'the response body is stored' },
        { at: 'GET /products', data: 'the second request', note: 'cache.get(key) → the array' },
        { at: 'HIT', data: 'X-Cache: HIT, no database', note: 'fast and possibly stale' },
      ],
    },
    {
      type: 'note',
      html: 'The middleware wraps <code>res.json</code>, so it stores exactly what the controller sent. That is why it can sit above every layer without knowing what a product is.',
    },
  ],

  18: [
    {
      type: 'p',
      html: `The writer owns invalidation. Every create, update and delete clears the cache; the next read repopulates it. Clearing everything is correct but blunt. A URL prefix is the optimisation, once the traffic justifies it.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'POST /products', data: 'a valid write', note: 'the data changes' },
        { at: 'repository', data: 'Product.create(data)', note: 'Mongo now has a new document' },
        { at: 'controller', data: 'cache.clear()', note: 'before the response is sent' },
        { at: 'next GET', data: 'X-Cache: MISS', note: 'the fresh list is rebuilt' },
        { at: 'later GET', data: 'X-Cache: HIT', note: 'warm again' },
      ],
    },
    {
      type: 'note',
      html: 'If you cache per user or per query, key by the full URL and clear the smallest prefix that is safe. A wrong key is a data leak; a missing clear is a stale page.',
    },
  ],

  19: [
    {
      type: 'p',
      html: `Every <code>process.env</code> read moves into one module. Boot validates the combination: in production, the development secrets are refused. Everything else imports <code>config</code>, so there is one place to look and one <code>.env.example</code> to copy.`,
    },
    {
      type: 'tree',
      rows: [
        ['src/config/index.js', 'reads and validates the environment — the only process.env in src'],
        ['src/config/database.js', 'uses config.mongoUri'],
        ['src/controllers/userController.js', 'uses config.accessSecret and the TTLs'],
        ['server.js', 'uses config.port and config.corsOrigins'],
      ],
    },
    {
      type: 'table',
      head: ['Value', 'Default for the course', 'Used by'],
      rows: [
        ['<code>PORT</code>', '8000', 'server.js'],
        ['<code>MONGODB_URI</code>', 'mongodb://127.0.0.1:27017/shop', 'database.js'],
        ['<code>ACCESS_TOKEN_SECRET</code>', 'dev-access-secret', 'login, requireAuth'],
        ['<code>REFRESH_TOKEN_SECRET</code>', 'dev-refresh-secret', 'refresh'],
        ['<code>CORS_ORIGINS</code>', 'http://localhost:5173', 'cors()'],
        ['<code>CACHE_TTL</code>', '60', 'GET /products'],
      ],
    },
    {
      type: 'note',
      html: 'Run <code>grep -rn "process.env" src</code>. Before this step: five files. After: one. The next person who clones the repo copies one file.',
    },
  ],

  20: [
    {
      type: 'p',
      html: `The documentation is generated from comments beside the route. It is not magically correct, but it lives in the same diff, so drift is visible in review. One mount serves the UI; another serves the raw document.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'route file', data: '@openapi … above router.post', note: 'the comment and the code together' },
        { at: 'swagger-jsdoc', data: 'scans src/routes/*.js', note: 'at boot' },
        { at: '/api-docs.json', data: 'one OpenAPI 3 document', note: 'consumable by tools' },
        { at: '/api-docs', data: 'Swagger UI', note: 'clickable, with the bearer scheme' },
      ],
    },
    {
      type: 'note',
      html: 'The UI is a development tool. In production you might serve the JSON only, or gate <code>/api-docs</code> behind auth. Either way, the document is generated from the same source.',
    },
  ],

  21: [
    {
      type: 'p',
      html: `<code>app.js</code> builds the app and exports it; <code>server.js</code> connects and listens. A test imports the app and calls it in-process, so there is no port, no network, and no open handle to forget.`,
    },
    {
      type: 'flow',
      hops: [
        { at: 'test', data: 'request(app).post("/products")', note: 'supertest builds the request' },
        { at: 'src/app.js', data: 'the whole middleware stack', note: 'the same one production uses' },
        { at: 'controllers → repositories', data: 'the real code', note: 'no mocks for the happy path' },
        { at: 'MongoDB', data: 'an in-memory server per run', note: 'fast, disposable, real Mongoose' },
        { at: 'assertion', data: '201, body.title === "Test"', note: 'the promise the API made' },
      ],
    },
    {
      type: 'ul',
      items: [
        'One test per promise the API makes, not one per line of code.',
        '401 without a token, 400 for a bad body, 403 for the wrong owner, 204 after a delete.',
        'The error handler and middleware are under test too, because they are in the same app.',
      ],
    },
    {
      type: 'note',
      html: 'Run <code>npm test</code>. Ten tests, no server left running, no network. That is the executable version of this course.',
    },
  ],
};

export const stepNumber = (branch) => {
  const match = branch.match(/^s(\d\d)-/);
  return match ? Number(match[1]) : null;
};
