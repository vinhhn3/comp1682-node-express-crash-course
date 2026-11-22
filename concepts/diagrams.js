/* One diagram per step. Small primitives, composed by hand, rendered into the
   step page. Everything is HTML/CSS so it stays sharp on a projector. */

const box = (title, sub = '', cls = '') =>
  `<div class="dg-box ${cls}"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;

const arrow = (label = '') =>
  `<div class="dg-arrow">${label ? `<span>${label}</span>` : ''}</div>`;

const harrow = (label = '') =>
  `<div class="dg-harrow">${label ? `<span>${label}</span>` : ''}</div>`;

const hrow = (...kids) => `<div class="dg-hrow">${kids.join('')}</div>`;

const row = (...kids) => `<div class="dg-row">${kids.join('')}</div>`;

const stage = (...kids) => `<div class="dg-stage">${kids.join('')}</div>`;

const split = (left, right, leftLabel = 'before', rightLabel = 'after') =>
  `<div class="dg-split">
     <div class="dg-panel"><span class="dg-cap">${leftLabel}</span>${left}</div>
     <div class="dg-panel"><span class="dg-cap">${rightLabel}</span>${right}</div>
   </div>`;

const note = (text) => `<p class="dg-note">${text}</p>`;

const codeBlock = (text) => `<pre class="dg-code">${text}</pre>`;

const snap = (tag, value, sub, cls = '') =>
  `<div class="dg-snap ${cls}"><span class="dg-cap">${tag}</span><b>${value}</b><small>${sub}</small></div>`;

const seg = (...parts) => `<div class="dg-seg">${parts.join('')}</div>`;

const layers = (rows) =>
  `<div class="dg-layers">${rows
    .map(
      ([name, text, cls = '']) =>
        `<div class="dg-layer ${cls}"><b>${name}</b><small>${text}</small></div>`,
    )
    .join('')}</div>`;

export const DIAGRAMS = {
  0: () =>
    stage(
      box('Request', 'GET /products · headers · no body'),
      arrow('one function, every request'),
      box('if (method === GET &amp;&amp; url === /products)', 'the entire router', 'a'),
      arrow('true'),
      box('200 + JSON', 'you set Content-Type yourself', 'ok'),
      note('false → 404. Both branches are yours, and so is every header.'),
    ),

  1: () =>
    stage(
      box('app.get("/products", fn)', 'a route in a list', 'a'),
      arrow('Express matches the method and the path'),
      box('fn(req, res)', 'your function'),
      arrow('res.json(products)'),
      box('200 + Content-Type: application/json', 'set for you', 'ok'),
      note('Express removed the if-statements. It did not remove the response.'),
    ),

  2: () =>
    stage(
      row(
        box('GET /products', 'the array'),
        box('GET /products/:id', 'req.params.id', 'a'),
        box('everything else', '404', 'bad'),
      ),
      note('Three routes, one array, one fallback — all in server.js.'),
      arrow('add a POST: where does the body get parsed?'),
      box('the same file, longer', 'data + routing + rules + errors', 'bad'),
    ),

  3: () =>
    stage(
      box('request body', '{"title":"Test Lamp","price":45}', 'dim'),
      arrow('express.json() parses it'),
      box('req.body', 'an object, or undefined if you forgot the middleware', 'a'),
      arrow('your type check'),
      row(
        box('201 + the new product', 'title, category, number', 'ok'),
        box('400 + a message', 'string price, missing title', 'bad'),
      ),
      note('One hand-written check. It already needs a second pair of eyes.'),
    ),

  4: () =>
    stage(
      box('server.js', 'app.use("/products", productRoutes)', 'a'),
      arrow('mounts the router'),
      row(
        box('router.get("/")', 'list'),
        box('router.get("/:id")', 'one'),
        box('router.post("/")', 'create'),
      ),
      note('server.js is a list of mounts now. The data moved into the router with the handlers.'),
    ),

  5: () =>
    stage(
      box('server.js', 'app.use("/products", productRoutes)'),
      arrow('the router only routes'),
      box('productRoutes.js', 'URL → function'),
      arrow('names a handler'),
      box('productController.js', 'the actual work', 'a'),
      note('The route file became a table of contents. The data came along, still in the wrong place.'),
    ),

  6: () =>
    stage(
      box('Controller', 'what to send back'),
      arrow('ask the repository'),
      box('Repository', 'findAll / findById / create', 'a'),
      arrow('an array today, a database later'),
      box('the data source', 'products array', 'dim'),
      note('The controller does not know where products live. That is the whole point of the layer.'),
    ),

  7: () =>
    stage(
      box('server.js', 'start()'),
      arrow('await before listen'),
      box('connectToDatabase()', 'src/config/database.js', 'a'),
      arrow('mongoose.connect(MONGODB_URI)'),
      box('MongoDB · shop', 'connected', 'ok'),
      note('Failure → log and process.exit(1). The server never half-starts.'),
    ),

  8: () =>
    stage(
      box('Controller', 'not touched', 'ok'),
      arrow('ask for the products'),
      box('Repository', 'rewritten', 'a'),
      arrow('ask the model for matches'),
      box('Model', 'schema → products collection'),
      note('The boundary earned its keep: one file changed, and the API stayed the same.'),
    ),

  9: () =>
    stage(
      box('the handler throws', 'AppError(404), a CastError, a zod issue', 'bad'),
      arrow('asyncHandler → .catch(next)'),
      box('errorHandler', 'one place, last in the stack', 'a'),
      arrow('status + JSON'),
      box('{ error: { message, status, details? } }', 'the same shape every time', 'ok'),
      note('zod → 400 · CastError → 400 · duplicate key → 409 · unknown route → 404 · the rest → 500.'),
    ),

  10: () =>
    stage(
      box('PATCH /products/:id', 'only the fields sent', 'a'),
      arrow('check only the fields that arrived'),
      box('controller.update', 'owner check, then save'),
      arrow('save the new value'),
      box('200 + the document', 'or 400 / 404', 'ok'),
      note('DELETE answers 204 with no body, and 404 when the document was already gone.'),
    ),

  11: () =>
    stage(
      box('POST /users/register', '{ username, password }'),
      arrow('bcrypt.hash(password, 10)'),
      box('$2b$10$…', 'one-way, salted, 60 characters', 'a'),
      arrow('User.create'),
      box('201', '{ id, username, role }', 'ok'),
      note('password: { select: false } — the hash does not leave the database by accident.'),
    ),

  12: () =>
    stage(
      box('POST /users/login', 'username + password'),
      arrow('find + bcrypt.compare'),
      box('the claim', '{ id, username, role }', 'a'),
      arrow('jwt.sign(secret)'),
      seg(
        '<span class="s1">header</span>',
        '<span class="s2">payload</span>',
        '<span class="s3">signature</span>',
      ),
      note('header and payload are readable base64. The signature is what cannot be forged.'),
    ),

  13: () =>
    stage(
      box('Authorization: Bearer …', 'or no header at all'),
      arrow('requireAuth verifies the signature'),
      box('req.user', 'id, username, role', 'a'),
      arrow('requireRole + owner check'),
      row(
        box('handler', '200 / 201', 'ok'),
        box('401', 'no token, or a bad one', 'bad'),
        box('403', 'a real user, refused', 'bad'),
      ),
      note('401 is "who are you?". 403 is "I know, and no".'),
    ),

  14: () =>
    split(
      stage(
        snap('access token', '15 min', 'sent on every request'),
        snap('refresh token', '7 days', 'sent only to /users/refresh'),
      ),
      stage(
        box('POST /users/refresh', 'the old refresh token'),
        arrow('verify, compare the stored hash'),
        box('a new pair', 'the old refresh token is now dead', 'ok'),
      ),
      'two lifetimes',
      'one rotation',
    ),

  15: () =>
    stage(
      box('request arrives', 'any route'),
      arrow('global limiter · 100 / minute / IP'),
      box('login limiter · 5 / minute', 'only /users/login', 'a'),
      arrow('is there count left?'),
      row(
        box('the handler runs', '200 / 401 / 500', 'ok'),
        box('429 + Retry-After', 'the handler never runs', 'bad'),
      ),
      note('Middleware runs in order. Put the limiter before the work it protects.'),
    ),

  16: () =>
    stage(
      box('page at :5173', 'origin A'),
      arrow('fetch the API from another origin'),
      box('the browser sends OPTIONS first', 'application/json + Authorization is not a simple request', 'a'),
      arrow('allow this origin'),
      box('the browser decides', 'curl never asks', 'ok'),
      note('A JSON POST with Authorization gets a preflight first. The browser sends the real request only after the header says yes.'),
    ),

  17: () =>
    stage(
      box('GET /products', 'first request'),
      arrow('cache.get(key)'),
      box('MISS', 'query Mongo, store the body', 'a'),
      arrow('cache.put(key, body, 60s)'),
      box('GET /products', 'second request'),
      arrow('cache.get(key)'),
      box('HIT', 'memory, no database', 'ok'),
      note('A write does not clear it yet. The list stays wrong for 60 seconds.'),
    ),

  18: () =>
    stage(
      box('POST · PATCH · DELETE', 'the writers'),
      arrow('cache.clear()'),
      box('every cached URL is gone', 'blunt, and correct', 'a'),
      arrow('the next GET'),
      box('MISS → fresh data', 'ok'),
      note('Correct before clever: clear everything, then key by URL prefix when the traffic justifies it.'),
    ),

  19: () =>
    split(
      codeBlock(`// before — five files
process.env.MONGODB_URI
process.env.ACCESS_TOKEN_SECRET
process.env.CORS_ORIGINS
process.env.CACHE_TTL
process.env.PORT`),
      codeBlock(`// after — one file
const config = require('./config');

config.mongoUri
config.accessSecret
config.corsOrigins
config.cacheTtlSeconds
config.port`),
      'scattered reads',
      'one reader',
    ),

  20: () =>
    stage(
      box('@openapi comment', 'above the route, same file', 'a'),
      arrow('read the comments in the route files'),
      box('/api-docs.json', 'one OpenAPI 3 document'),
      arrow('swagger-ui-express'),
      box('/api-docs', 'a page you can click', 'ok'),
      note('The docs live next to the route, so drift shows up in the same diff.'),
    ),

  21: () =>
    stage(
      box('server.js', 'connect, then listen'),
      arrow('require'),
      box('src/app.js', 'the whole app, no port', 'a'),
      arrow('call it in-process'),
      box('the test run', 'in-process, no network, no open handle', 'ok'),
      note('app.listen is a deployment detail. The app is the thing under test.'),
    ),
};
