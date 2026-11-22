/* Rich material from the deep pages, placed in the step where it is taught.
   The step page renders EXPLAIN first, then these blocks, so a student never
   has to leave the tab to get the full explanation. */

const FULL_TREE = `<b>node-express-crash-course/</b>
├── <b>server.js</b>              <span class="c">connect to MongoDB, then listen</span>
├── <b>src/</b>
│   ├── <b>app.js</b>             <span class="c">the Express app — no port, so tests can import it</span>
│   ├── <b>config/</b>
│   │   ├── index.js         <span class="c">the only reader of process.env</span>
│   │   ├── database.js      <span class="c">mongoose.connect, fail fast</span>
│   │   └── rateLimitConfig.js
│   ├── <b>routes/</b>            <span class="c">URL + verb → middleware → controller</span>
│   │   ├── productRoutes.js
│   │   └── userRoutes.js
│   ├── <b>controllers/</b>        <span class="c">HTTP in, HTTP out; status codes live here</span>
│   │   ├── productController.js
│   │   └── userController.js
│   ├── <b>repositories/</b>       <span class="c">the only code that touches a model</span>
│   │   ├── productRepository.js
│   │   └── userRepository.js
│   ├── <b>models/</b>             <span class="c">Mongoose schemas: the shape and its rules</span>
│   │   ├── product.js
│   │   └── user.js
│   ├── <b>middlewares/</b>        <span class="c">run before the handler, can stop it</span>
│   │   ├── authMiddleware.js
│   │   ├── validate.js
│   │   ├── cacheMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   └── errorMiddleware.js
│   ├── <b>schemas/</b>            <span class="c">zod: what a request body must look like</span>
│   ├── <b>errors/</b>             <span class="c">AppError: a message and a status</span>
│   ├── <b>utils/</b>              <span class="c">asyncHandler, small helpers</span>
│   └── <b>docs/</b>               <span class="c">swagger.js: the OpenAPI document</span>
├── <b>test/</b>                   <span class="c">supertest against app.js, in-memory MongoDB</span>
├── <b>scripts/</b>                <span class="c">course machinery: step, concept, seed, db</span>
├── <b>concepts/</b>               <span class="c">this teaching UI</span>
├── <b>docs/</b>                   <span class="c">run sheet, API notes</span>
└── <b>.env.example</b>            <span class="c">every value, with a safe development default</span>`;

export const RICH = {
  0: [
    {
      type: 'h',
      text: 'The four parts of an HTTP message',
    },
    {
      type: 'table',
      head: ['Part', 'In a request', 'In a response'],
      rows: [
        ['start line', '<code>GET /products HTTP/1.1</code>', '<code>HTTP/1.1 200 OK</code>'],
        ['headers', 'what the client sends: content type, token, accept', 'what the server says: type, length, cache, permission'],
        ['body', 'a JSON object, or nothing for a GET', 'the products, or nothing for a 204'],
        ['the connection', 'one request can reuse a TCP connection', 'the response closes when the body is written'],
      ],
    },
    {
      type: 'h',
      text: 'The status codes you will meet',
    },
    {
      type: 'table',
      head: ['Code', 'Means', 'Where it appears here'],
      rows: [
        ['<b>200</b>', 'here it is', 'GET, PATCH'],
        ['<b>201</b>', 'I made it', 'POST a product, register'],
        ['<b>204</b>', 'done, no body', 'DELETE, logout'],
        ['<b>400</b>', 'your request is wrong', 'a bad body, a malformed id'],
        ['<b>401</b>', 'I do not know you', 'no token, bad signature, bad password'],
        ['<b>403</b>', 'I know you, and no', 'wrong role, not the owner'],
        ['<b>404</b>', 'not here', 'a missing product or route'],
        ['<b>409</b>', 'that already exists', 'a duplicate username'],
        ['<b>429</b>', 'slow down', 'the rate limiter'],
        ['<b>500</b>', 'I broke', 'a bug, not the client'],
      ],
    },
    {
      type: 'h',
      text: 'Four headers worth knowing now',
    },
    {
      type: 'table',
      head: ['Header', 'Answers'],
      rows: [
        ['<code>Content-Type</code>', 'what the body is: <code>application/json</code>'],
        ['<code>Authorization</code>', 'who the client claims to be: <code>Bearer &lt;token&gt;</code>'],
        ['<code>Access-Control-Allow-Origin</code>', 'may a browser on another origin read this?'],
        ['<code>Cache-Control</code>', 'may this answer be reused, and for how long?'],
      ],
    },
  ],

  1: [
    {
      type: 'h',
      text: 'What Express removed, and what it did not',
    },
    {
      type: 'table',
      head: ['Express removes', 'You still own'],
      rows: [
        ['matching a method and a path', 'choosing the status code'],
        ['parsing the JSON body (with one middleware)', 'deciding what a valid body is'],
        ['setting <code>Content-Type</code> for <code>res.json</code>', 'the shape of the JSON'],
        ['the 404 fallback, if you add one', 'the 404 message and the error shape'],
        ['the queue that runs middleware in order', 'the order itself'],
      ],
    },
    {
      type: 'h',
      text: 'Three rules of the queue',
    },
    {
      type: 'ul',
      items: [
        'Middleware runs in the order it was registered. There is no priority system.',
        'A middleware that sends a response and does not call <code>next()</code> stops the queue.',
        '<code>next(err)</code> skips every normal middleware and jumps to the error handler.',
      ],
    },
  ],

  2: [
    {
      type: 'h',
      text: 'The route table, before it gets big',
    },
    {
      type: 'table',
      head: ['Method', 'Path', 'Answers', 'When it is missing'],
      rows: [
        ['GET', '<code>/products</code>', 'the whole array', '—'],
        ['GET', '<code>/products/:id</code>', 'one product', '<code>404</code>'],
        ['everything else', 'any path', '<code>404</code>', '—'],
      ],
    },
    {
      type: 'note',
      html: 'An empty <code>200</code> for a missing product is a lie the client has to detect. A <code>404</code> is the answer. Status codes are part of the contract.',
    },
  ],

  3: [
    {
      type: 'h',
      text: 'Without the parser, there is no body',
    },
    {
      type: 'compare',
      left: {
        label: 'no express.json()',
        text: `app.post('/products', (req, res) => {
  console.log(req.body);
  // undefined
});`,
      },
      right: {
        label: 'with express.json()',
        text: `app.use(express.json());

app.post('/products', (req, res) => {
  console.log(req.body);
  // { title: 'Test Lamp', price: 45 }
});`,
      },
    },
    {
      type: 'h',
      text: 'Every body check has the same four jobs',
    },
    {
      type: 'ul',
      items: [
        '<b>Required</b>: which fields must be there?',
        '<b>Type</b>: is the price a number, or the string "45"?',
        '<b>Range</b>: can the price be negative? Can the stock?',
        '<b>Unknown fields</b>: may the client set <code>createdBy</code>? (No.)',
      ],
    },
    {
      type: 'note',
      html: 'This is exactly why step 9 moves the rules into a schema: one place, reusable, and it removes fields the client was never allowed to send.',
    },
  ],

  4: [
    {
      type: 'h',
      text: 'Where the router sits',
    },
    {
      type: 'tree',
      rows: [
        ['server.js', 'creates the app, mounts the router at /products, listens'],
        ['src/routes/productRoutes.js', 'the list, one item and the create — and, for now, the data'],
      ],
    },
    {
      type: 'h',
      text: 'Import rules at this point',
    },
    {
      type: 'table',
      head: ['File', 'May use', 'Must not use'],
      rows: [
        ['<code>server.js</code>', 'routes, config, middleware', 'a product query or a product rule'],
        ['<code>routes/</code>', 'controllers, middleware, schemas', 'a model, a database query'],
      ],
    },
    {
      type: 'note',
      html: '<code>app.use("/products", productRoutes)</code> means the router’s <code>"/"</code> is the API’s <code>/products</code>. The mount path is the only place the prefix exists.',
    },
  ],

  5: [
    {
      type: 'h',
      text: 'Three files, three jobs',
    },
    {
      type: 'tree',
      rows: [
        ['src/routes/productRoutes.js', 'URL + verb → which function'],
        ['src/controllers/productController.js', 'read the request, choose a status, send JSON'],
        ['the data', 'still inside the controller — the next boundary'],
      ],
    },
    {
      type: 'table',
      head: ['Layer', 'Owns', 'Must not own'],
      rows: [
        ['router', 'paths, verbs, which handler', 'status codes, data, queries'],
        ['controller', '<code>req</code>, <code>res</code>, status, JSON', 'the storage mechanism'],
      ],
    },
    {
      type: 'ul',
      items: [
        'A controller may read <code>req.params</code>, <code>req.query</code> and <code>req.body</code>.',
        'It may choose <code>200</code>, <code>201</code>, <code>204</code> or throw an <code>AppError</code>.',
        'It may not build a database query or know a collection name.',
      ],
    },
  ],

  6: [
    {
      type: 'h',
      text: 'The boundary, drawn',
    },
    {
      type: 'tree',
      rows: [
        ['src/controllers/productController.js', 'the HTTP conversation only'],
        ['src/repositories/productRepository.js', 'findAll, findById, create — the only data access'],
        ['the storage', 'an array today; MongoDB at step 8'],
      ],
    },
    {
      type: 'compare',
      left: {
        label: 'before — controller owns the array',
        text: `const products = [ ... ];

exports.getAll = (req, res) => {
  res.json(products);
};`,
      },
      right: {
        label: 'after — controller asks',
        text: `exports.getAll = async (req, res) => {
  const products =
    await productRepository.findAll();
  res.json(products);
};`,
      },
    },
    {
      type: 'note',
      html: 'The repository is the seam. A cache, a seed script, a second database or a test can use it without faking an HTTP request.',
    },
    {
      type: 'h',
      text: 'The whole stack, in one table',
    },
    {
      type: 'table',
      head: ['Layer', 'Owns', 'Must not own'],
      rows: [
        ['<code>server.js</code>', 'compose the app, connect, listen', 'a product rule or a query'],
        ['<code>routes/</code>', 'URL + verb → middleware + controller', 'data, status codes, storage'],
        ['<code>middlewares/</code>', 'auth, validation, cache, rate limit', 'the business rule it protects'],
        ['<code>controllers/</code>', '<code>req</code>, <code>res</code>, status, JSON', 'a model or a database query'],
        ['<code>repositories/</code>', 'the only data access', '<code>req</code>, <code>res</code>, a status code'],
        ['<code>models/</code>', 'the stored shape and its rules', 'HTTP or who may write'],
        ['<code>MongoDB</code>', 'documents, indexes, queries', 'Express, tokens, status codes'],
        ['<code>config/</code>', 'one reader of the environment', 'app logic or defaults for data'],
      ],
    },
    {
      type: 'h',
      text: 'Where does a new file go?',
    },
    {
      type: 'table',
      head: ['The thing', 'The home', 'Because'],
      rows: [
        ['a URL and its verb', '<code>routes/</code>', 'a path is a routing fact'],
        ['a status code or a 404', '<code>controllers/</code>', 'it is an HTTP answer'],
        ['a database query', '<code>repositories/</code>', 'only this layer knows storage'],
        ['a stored field or index', '<code>models/</code>', 'the shape outlives HTTP'],
        ['“who is this token?”', '<code>middlewares/</code>', 'it runs before the handler and can stop it'],
        ['a request body shape', '<code>schemas/</code>', 'validation belongs at the edge'],
        ['a port, URI or secret', '<code>config/</code>', 'one reader, one .env.example'],
        ['a pure helper', '<code>utils/</code>', 'no HTTP, no database'],
      ],
    },
    {
      type: 'note',
      html: 'The address answers what the file may import before anyone opens it. That is why the folders appear one at a time: each one exists to stop a file from knowing too much.',
    },
    {
      type: 'h',
      text: 'The whole folder — where this is going',
    },
    {
      type: 'treecode',
      html: FULL_TREE,
    },
    {
      type: 'note',
      html: 'Half of these files do not exist yet. The tree is the destination, not a step requirement: <code>models/</code> arrives with MongoDB, <code>middlewares/</code> with auth and validation, <code>app.js</code> and <code>test/</code> at the end.',
    },
    {
      type: 'h',
      text: 'The life of one request, at this point',
    },
    {
      type: 'flow',
      hops: [
        { at: 'Browser', data: 'POST /products  { title, category, price }', note: 'a write, no token yet' },
        { at: 'Router', data: 'POST /products → create', note: 'the URL picks the function' },
        { at: 'Controller', data: 'productRepository.create({ ... })', note: 'HTTP shapes become plain values' },
        { at: 'Repository', data: 'nextId++, products.push(...)', note: 'the data is an array' },
        { at: 'Response', data: '201 + { id, title, ... }', note: 'the controller formats it' },
      ],
      note: 'Step 7 adds the database. Steps 9 and 13 add the checks before the controller. The shape of the walk does not change; the boxes underneath it do.',
    },
  ],

  7: [
    {
      type: 'h',
      text: 'Where the values live',
    },
    {
      type: 'tree',
      rows: [
        ['src/config/database.js', 'the only file that knows the connection string'],
        ['.env / .env.example', 'the values that change between machines'],
        ['server.js', 'calls connect once, then listens'],
      ],
    },
    {
      type: 'table',
      head: ['Value', 'Default for the course', 'Why it is configurable'],
      rows: [
        ['<code>PORT</code>', '<code>8000</code>', 'the same code runs on another port'],
        ['<code>MONGODB_URI</code>', '<code>mongodb://127.0.0.1:27017/shop</code>', 'laptop, CI and Atlas differ'],
        ['<code>ACCESS_TOKEN_SECRET</code>', 'a development fallback', 'production must supply its own'],
      ],
    },
    {
      type: 'note',
      html: 'Connect once, before <code>listen</code>. A connection per request wastes a handshake and makes every handler worry about connection state. If the first connection fails, exit: a half-started server is worse than a clear failure.',
    },
  ],

  8: [
    {
      type: 'h',
      text: 'What the model promises',
    },
    {
      type: 'table',
      head: ['Field', 'Type', 'Rule'],
      rows: [
        ['<code>title</code>', 'string', 'required, trimmed'],
        ['<code>category</code>', 'string', 'required, trimmed'],
        ['<code>price</code>', 'number', 'required, cannot be negative'],
        ['<code>description</code>', 'string', 'optional, empty by default'],
        ['<code>stock</code>', 'number', 'optional, integer, cannot be negative'],
        ['<code>createdAt</code> / <code>updatedAt</code>', 'date', 'set by <code>timestamps</code>'],
      ],
    },
    {
      type: 'h',
      text: 'What the client actually sees',
    },
    {
      type: 'table',
      head: ['Inside MongoDB', 'In the JSON', 'Why'],
      rows: [
        ['<code>_id: ObjectId("…")</code>', '<code>id: "…"</code>', 'the client expects a string id'],
        ['<code>__v: 0</code>', 'removed', 'a Mongoose detail, not API data'],
        ['<code>createdAt</code>', 'ISO string', 'readable by every client'],
      ],
    },
    {
      type: 'note',
      html: 'The controller did not change. The repository changed, the model appeared, and the wire shape stayed the same. That is the boundary paying rent.',
    },
  ],

  9: [
    {
      type: 'h',
      text: 'The failure path, in order',
    },
    {
      type: 'flow',
      hops: [
        { at: 'router', data: 'the URL matched', note: 'the request is allowed to continue' },
        { at: 'auth check', data: 'a known user', note: 'otherwise 401, and nothing below runs' },
        { at: 'body check', data: 'clean fields', note: 'otherwise 400 with details' },
        { at: 'controller', data: 'the work', note: 'a throw becomes next(err)' },
        { at: 'error handler', data: 'one JSON shape', note: 'last in the stack, four arguments' },
      ],
    },
    {
      type: 'ul',
      items: [
        'The error handler is registered last. Put it earlier and normal middleware runs after it.',
        'It has four arguments: <code>(err, req, res, next)</code>. Three arguments makes it normal middleware.',
        'Every failure returns <code>{ error: { message, status, details? } }</code>. Details are optional; the shape is not.',
      ],
    },
    {
      type: 'compare',
      left: {
        label: 'without asyncHandler',
        text: `router.get('/', async (req, res) => {
  const products = await repository.findAll();
  // if this rejects: unhandled rejection
  res.json(products);
});`,
      },
      right: {
        label: 'with asyncHandler',
        text: `router.get('/', asyncHandler(async (req, res) => {
  const products = await repository.findAll();
  res.json(products);
}));
// a rejection becomes next(err)`,
      },
    },
  ],

  10: [
    {
      type: 'h',
      text: 'The verbs, and what each one promises',
    },
    {
      type: 'table',
      head: ['Verb', 'Body', 'Success', 'Means'],
      rows: [
        ['GET', 'none', '200', 'read, no side effect'],
        ['POST', 'the new resource', '201', 'create'],
        ['PATCH', 'only the changed fields', '200', 'partial update'],
        ['PUT', 'the whole resource', '200', 'replace; missing fields are cleared or defaulted'],
        ['DELETE', 'none', '204', 'remove; the next read is a 404'],
      ],
    },
    {
      type: 'note',
      html: 'This course uses <code>PATCH</code> because the client usually changes one field. A <code>PUT</code> that forgets a field is not a small bug: it can wipe data.',
    },
    {
      type: 'table',
      head: ['Situation', 'Answer'],
      rows: [
        ['the update is valid', '<code>200</code> + the updated product'],
        ['the body has a bad price', '<code>400</code> + details'],
        ['the id is not an ObjectId', '<code>400</code>'],
        ['the product does not exist', '<code>404</code>'],
        ['the delete worked', '<code>204</code>, no body'],
        ['the delete was already done', '<code>404</code>'],
      ],
    },
  ],

  11: [
    {
      type: 'h',
      text: 'Where the password is allowed to be',
    },
    {
      type: 'table',
      head: ['Place', 'What is there', 'Who can read it'],
      rows: [
        ['the request body', 'the plain password', 'the server, once'],
        ['the hash step', 'a salted one-way hash', 'the code that hashes it'],
        ['MongoDB', 'only the hash', 'a query that asks for <code>+password</code> explicitly'],
        ['the response', 'nothing', 'the client never receives it'],
      ],
    },
    {
      type: 'ul',
      items: [
        '<code>bcrypt.hash(password, 10)</code> is deliberately slow; that is the protection.',
        '<code>password: { select: false }</code> means a normal query cannot return it by accident.',
        'The response is <code>{ id, username, role }</code>. No password, no hash, no token yet.',
      ],
    },
    {
      type: 'note',
      html: 'A unique index is the real duplicate guard. Two simultaneous registrations can both pass the <code>findOne</code> check; the database decides, the 11000 error becomes <code>409</code>.',
    },
  ],

  12: [
    {
      type: 'widget',
      widget: 'jwt',
    },
    {
      type: 'h',
      text: 'The three parts, and who can read them',
    },
    {
      type: 'table',
      head: ['Part', 'Contains', 'Readable?', 'Forgeable?'],
      rows: [
        ['header', 'the algorithm, usually HS256', 'yes — base64', 'no, the signature covers it'],
        ['payload', 'id, username, role, expiry', 'yes — base64', 'no, changing it breaks the signature'],
        ['signature', 'HMAC of header + payload + secret', 'yes, but useless', 'no, without the secret'],
      ],
    },
    {
      type: 'table',
      head: ['What the client does', 'Header'],
      rows: [
        ['sends the access token', '<code>Authorization: Bearer &lt;token&gt;</code>'],
        ['keeps it for', '15 minutes'],
        ['does not send the password again', 'the token is the proof'],
      ],
    },
    {
      type: 'note',
      html: 'A JWT is not encrypted. The payload is readable by anyone who has the token. Never put a password, an email you would not show, or a secret in it.',
    },
  ],

  13: [
    {
      type: 'h',
      text: 'Who may do what',
    },
    {
      type: 'table',
      head: ['Route', 'Who', 'Failure'],
      rows: [
        ['<code>GET /products</code>', 'anyone', '—'],
        ['<code>POST /products</code>', 'a valid token', '<code>401</code>'],
        ['<code>PATCH /products/:id</code>', 'the owner or an admin', '<code>401</code>, then <code>403</code>'],
        ['<code>DELETE /products/:id</code>', 'an admin', '<code>401</code>, then <code>403</code>'],
      ],
    },
    {
      type: 'h',
      text: 'The order that makes the policy cheap',
    },
    {
      type: 'flow',
      hops: [
        { at: 'limiter', data: 'count the request', note: 'before anything expensive' },
        { at: 'cors', data: 'is this origin allowed?', note: 'a browser rule, checked early' },
        { at: 'express.json', data: 'parse the body', note: 'now req.body exists' },
        { at: 'requireAuth', data: 'who is this?', note: '401 if unknown' },
        { at: 'validate', data: 'are the fields valid?', note: '400 only for known users' },
        { at: 'controller', data: 'the work', note: 'the first code that touches data' },
      ],
    },
    {
      type: 'note',
      html: 'Auth before validation is deliberate: an anonymous caller gets 401 and learns nothing about your field names. <b>401</b> means “who are you?”; <b>403</b> means “I know, and no”.',
    },
  ],

  14: [
    {
      type: 'widget',
      widget: 'rotate',
    },
    {
      type: 'h',
      text: 'Two tokens, two jobs',
    },
    {
      type: 'table',
      head: ['Token', 'Lifetime', 'Sent where', 'Stored as'],
      rows: [
        ['access', '15 minutes', 'every protected request', 'not stored on the server'],
        ['refresh', '7 days', 'only <code>/users/refresh</code>', 'a SHA-256 fingerprint on the user'],
      ],
    },
    {
      type: 'ul',
      items: [
        'A stolen access token is useful for at most 15 minutes.',
        'A stolen refresh token is refused after the real client rotates it, because the fingerprint no longer matches.',
        'A production SPA would keep the refresh token in an HttpOnly cookie; the course returns it in the body so you can see it.',
        'A reused old refresh token is a signal of theft. A real system would revoke the whole token family.',
      ],
    },
  ],

  15: [
    {
      type: 'widget',
      widget: 'chain',
    },
    {
      type: 'h',
      text: 'Two doors, two limits',
    },
    {
      type: 'table',
      head: ['Limiter', 'Scope', 'Window', 'Max', 'Why'],
      rows: [
        ['global', 'every route, per IP', '60 s', '100', 'a flood should not reach the app'],
        ['login', '<code>POST /users/login</code>, per IP', '60 s', '5', 'the brute-force door'],
      ],
    },
    {
      type: 'ul',
      items: [
        'A <code>429</code> carries <code>RateLimit-*</code> headers and a <code>Retry-After</code>.',
        'The limiter runs before auth, validation and the handler, so a flood costs almost nothing.',
        'Behind a proxy, set <code>trust proxy</code>; otherwise every request looks like it came from the proxy.',
      ],
    },
  ],

  16: [
    {
      type: 'widget',
      widget: 'cors',
    },
    {
      type: 'h',
      text: 'The three mistakes everyone makes',
    },
    {
      type: 'ul',
      items: [
        '<b>Blaming the server.</b> The route logs a 200; the browser shows a failure. The response is missing a header the browser wanted.',
        '<b>Adding the header in the error handler.</b> A 500 without CORS looks like a network failure. Put <code>cors()</code> early, before the routes.',
        '<b>Using <code>*</code> with credentials.</b> Cookies plus a wildcard origin is refused. Echo the exact origin and send <code>Vary: Origin</code>.',
      ],
    },
    {
      type: 'note',
      html: 'curl never asks. That is why a CORS error is a browser symptom, and why the server log still shows a successful request. The preflight is a separate <code>OPTIONS</code> request, not the real one.',
    },
  ],

  17: [
    {
      type: 'h',
      text: 'What the cache stores, and for how long',
    },
    {
      type: 'table',
      head: ['Decision', 'In this step'],
      rows: [
        ['key', 'the full URL, including <code>?q=</code> and <code>?category=</code>'],
        ['value', 'the exact JSON body the controller sent'],
        ['lifetime', '60 seconds'],
        ['proof', '<code>X-Cache: HIT</code> or <code>MISS</code> on every response'],
        ['invalidation', 'none yet — that is the bug in step 17'],
      ],
    },
    {
      type: 'note',
      html: 'A cache turns a read into memory. It also turns a write into a lie until the old answer is cleared. The next step is the clear.',
    },
  ],

  18: [
    {
      type: 'h',
      text: 'Four ways to invalidate, from blunt to precise',
    },
    {
      type: 'table',
      head: ['Strategy', 'How', 'Trade-off'],
      rows: [
        ['clear everything', '<code>cache.clear()</code> after every write', 'simple and correct; throws away unrelated answers'],
        ['prefix clear', 'delete keys that start with <code>/products</code>', 'keeps other resources warm; needs a key convention'],
        ['versioned key', 'include a version that changes on write', 'no deletion; old keys expire by TTL'],
        ['short TTL', 'let it expire on its own', 'a stale window you accept on purpose'],
      ],
    },
    {
      type: 'note',
      html: 'Correct before clever. Clear everything while the app is small; once a wrong key or a missed clear is expensive, move to a prefix and a key convention.',
    },
  ],

  19: [
    {
      type: 'h',
      text: 'What belongs in config, and what does not',
    },
    {
      type: 'tree',
      rows: [
        ['src/config/index.js', 'reads once, validates, exports plain values'],
        ['src/config/database.js', 'asks config for the URI'],
        ['auth, cors, cache, server', 'ask config; never read <code>process.env</code> directly'],
      ],
    },
    {
      type: 'compare',
      left: {
        label: 'before',
        text: `// five files, five answers
process.env.MONGODB_URI
process.env.ACCESS_TOKEN_SECRET
process.env.CORS_ORIGINS
process.env.CACHE_TTL
process.env.PORT`,
      },
      right: {
        label: 'after',
        text: `// one file
const config = require('./config');

config.mongoUri
config.accessSecret
config.corsOrigins
config.cacheTtlSeconds
config.port`,
      },
    },
    {
      type: 'note',
      html: 'Boot validates the combination, not just the presence: a non-numeric port, a negative TTL, or a production boot with the development secrets all stop before a request is served.',
    },
    {
      type: 'h',
      text: 'The whole folder — finished',
    },
    {
      type: 'treecode',
      html: FULL_TREE,
    },
    {
      type: 'h',
      text: 'The finished tree, one line per folder',
    },
    {
      type: 'tree',
      rows: [
        ['server.js', 'connect, then listen — no routes, no rules'],
        ['src/app.js', 'the Express app; imported by the tests'],
        ['src/config/', 'one reader of the environment'],
        ['src/routes/', 'URL + verb → middleware + controller'],
        ['src/controllers/', 'HTTP in, HTTP out'],
        ['src/repositories/', 'the only code that touches a model'],
        ['src/models/', 'the stored shape and its rules'],
        ['src/middlewares/', 'auth, validation, cache, rate limit, errors'],
        ['src/schemas/', 'zod: what a request body must look like'],
        ['src/errors/', 'AppError: a message and a status'],
        ['src/utils/', 'asyncHandler and small helpers'],
        ['src/docs/', 'the OpenAPI document, built at boot'],
        ['test/', 'supertest against app.js, a disposable database'],
      ],
    },
    {
      type: 'h',
      text: 'The life of one request, end to end',
    },
    {
      type: 'flow',
      hops: [
        { at: 'Browser', data: 'POST /products  ·  Bearer token  ·  { title, price }', note: 'one request, three kinds of data' },
        { at: 'Route', data: 'POST /products → requireAuth → validate → create', note: 'the URL and the checks are visible in one line' },
        { at: 'Middleware', data: 'req.user = { id, role }  ·  req.body = clean fields', note: 'either check can stop the request' },
        { at: 'Controller', data: 'productRepository.create({ ...req.body, createdBy })', note: 'no query, no status from below' },
        { at: 'Repository', data: 'Product.create(data)', note: 'plain values become a document' },
        { at: 'MongoDB', data: 'insertOne', note: 'the database validates the shape again' },
        { at: 'Response', data: '201  ·  { id, title, category, price, ... }', note: 'the document becomes JSON, _id becomes id' },
      ],
      note: 'This is the whole architecture in one line: the request walks down through the boxes, the response comes back up, and each box changes the shape only as much as its job requires.',
    },
    {
      type: 'h',
      text: 'Why the folders appeared in this order',
    },
    {
      type: 'table',
      head: ['Step', 'Folder', 'The pain it removed'],
      rows: [
        ['4', 'routes/', 'every URL in server.js'],
        ['5', 'controllers/', 'handlers inside the router'],
        ['6', 'repositories/', 'data inside the controller'],
        ['7–8', 'config/, models/', 'a connection string and a shape with no rules'],
        ['9', 'errors/, utils/, schemas/, middlewares/', 'failure handling in every handler'],
        ['11–14', 'user files, auth middleware', 'identity and authorization'],
        ['15–18', 'rate limit, cors, cache', 'cross-cutting concerns'],
        ['19–21', 'config, docs, app/test', 'operating and proving the app'],
      ],
    },
    {
      type: 'note',
      html: 'Nothing was created before it was needed. That is why the tree makes sense at the end and not at the start: each folder answers a problem the previous step created. At this step, <code>docs/</code>, <code>app.js</code> and <code>test/</code> are still ahead — the last two steps add them.',
    },
  ],

  20: [
    {
      type: 'h',
      text: 'One comment, three readers',
    },
    {
      type: 'table',
      head: ['Source', 'Output', 'Reader'],
      rows: [
        ['<code>@openapi</code> above the route', 'one OpenAPI 3 document', '<code>/api-docs.json</code>'],
        ['the same document', 'Swagger UI', 'a person at <code>/api-docs</code>'],
        ['the same document', 'generated clients or tests', 'other tools'],
      ],
    },
    {
      type: 'ul',
      items: [
        'Document the request body, the success status and the error status. That is the contract.',
        'Declare the bearer scheme once, then reference it from every protected route.',
        'The UI is a development tool; in production serve the JSON only, or gate the page.',
      ],
    },
    {
      type: 'note',
      html: 'The comment can still drift from the route. Keeping it in the same file means the drift appears in the same diff, next to the code that changed.',
    },
  ],

  21: [
    {
      type: 'h',
      text: 'The ten promises the suite checks',
    },
    {
      type: 'table',
      head: ['Test', 'The promise'],
      rows: [
        ['health', 'the app answers without a database row'],
        ['list + cache', 'the wire shape and the cache header'],
        ['no token', 'a write without identity is <code>401</code>'],
        ['register', 'a user is created and the password never leaks'],
        ['login', 'a wrong password is <code>401</code>; a right one returns two tokens'],
        ['create + validate', 'a bad body is <code>400</code>; a good one records the owner'],
        ['ownership', 'a non-owner gets <code>403</code>; an admin may edit'],
        ['delete', 'only an admin deletes; the next read is <code>404</code>'],
        ['unknown route', 'the same error shape as every other failure'],
        ['refresh', 'rotation works; the old token is refused; logout revokes'],
      ],
    },
    {
      type: 'compare',
      left: {
        label: 'src/app.js',
        text: `const app = express();
app.use(express.json());
app.use('/products', productRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;`,
      },
      right: {
        label: 'server.js',
        text: `const app = require('./src/app');
const connect = require('./src/config/database');

async function start() {
  await connect();
  app.listen(config.port);
}
start();`,
      },
    },
    {
      type: 'ul',
      items: [
        'No port, no network: supertest calls the app in-process.',
        'A real in-memory MongoDB, so Mongoose and the repository are exercised, not mocked.',
        'The same middleware, error handler and routes as production — the test is the app.',
      ],
    },
    {
      type: 'h',
      text: 'The whole folder, one last time',
    },
    {
      type: 'treecode',
      html: FULL_TREE,
    },
    {
      type: 'h',
      text: 'The life of one request, one last time',
    },
    {
      type: 'flow',
      hops: [
        { at: 'Browser', data: 'POST /products  ·  Bearer token  ·  { title, price }', note: 'the request starts with three kinds of data' },
        { at: 'Route', data: 'POST /products → requireAuth → validate → create', note: 'the path and its checks in one line' },
        { at: 'Middleware', data: 'req.user = { id, role }  ·  req.body = clean fields', note: 'a no stops the request here' },
        { at: 'Controller', data: 'productRepository.create({ ...req.body, createdBy })', note: 'HTTP shapes become plain values' },
        { at: 'Repository', data: 'Product.create(data)', note: 'plain values become a document' },
        { at: 'MongoDB', data: 'insertOne', note: 'the database validates the shape again' },
        { at: 'Response', data: '201  ·  { id, title, category, price, ... }', note: 'the document becomes JSON, _id becomes id' },
      ],
      note: 'You built this from one <code>http.createServer</code> that answered a single URL. The boxes changed; the direction never did: request down, response up.',
    },
  ],
};
