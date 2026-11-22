# Architecture of the finished API

This is the last 20 minutes of the course, written down. The app is small on purpose:
you can see every file at once, so the structure is the lesson.

## The tree

```
node-express-crash-course/
├── server.js                 connect to MongoDB, then listen
├── src/
│   ├── app.js                the Express app; no port, so tests can import it
│   ├── config/
│   │   ├── index.js          the only reader of process.env
│   │   ├── database.js       mongoose.connect, fail fast
│   │   └── rateLimitConfig.js
│   ├── routes/
│   │   ├── productRoutes.js  URL + verb → middleware → controller
│   │   └── userRoutes.js
│   ├── controllers/
│   │   ├── productController.js
│   │   └── userController.js
│   ├── repositories/
│   │   ├── productRepository.js
│   │   └── userRepository.js
│   ├── models/
│   │   ├── product.js
│   │   └── user.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── validate.js
│   │   ├── cacheMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   └── errorMiddleware.js
│   ├── schemas/
│   │   ├── productSchemas.js
│   │   └── userSchemas.js
│   ├── errors/
│   │   └── AppError.js
  ├── utils/
│   │   └── asyncHandler.js
  └── docs/
      └── swagger.js          the OpenAPI document, generated at boot
├── test/
│   └── api.test.js
├── scripts/                  course machinery + seed
├── concepts/                 the teaching UI
├── docs/
│   └── run-sheet.md
└── .env.example
```

## Who may import whom

```
routes/        →  controllers, middlewares, schemas, config
controllers/   →  repositories, errors, utils, config
repositories/  →  models
models/        →  mongoose only
middlewares/   →  config, errors, schemas (validate only)
schemas/       →  zod only
config/        →  dotenv only
app.js         →  routes, middlewares, config
server.js      →  app, config/database
```

Two rules cover all of it:

1. **Only repositories touch models. Only controllers touch `req` and `res`.** A
   component in any other layer that breaks this is in the wrong file.
2. **Dependencies point down.** `models/product.js` can never import a controller, a
   route or a middleware. If you need that, the logic is in the wrong layer.

`models/` importing nothing from the app is the strongest line in the table. A model
depends on Mongoose and on nothing you wrote.

## The request lifecycle

```
Browser
  │  POST /products   Authorization: Bearer …   { title, price }
  ▼
server.js        the app is already built; this file only listens
  ▼
app.js           rate limit → cors → express.json → routes → notFound → errorHandler
  ▼
routes/          POST /products → requireAuth → validate → productController.create
  ▼
middlewares/     jwt.verify → req.user      zod.parse → req.body
  ▼
controllers/     read req.user and req.body, call the repository, choose 201
  ▼
repositories/    Product.create({ ...data, createdBy })
  ▼
models/          schema validation, timestamps, toJSON
  ▼
MongoDB          insertOne
  │
  └── document ──► repository ──► controller ──► res.json ──► 201 + JSON
```

The response does not “return” through the middleware chain. `res.json` writes to the
socket; the call stack unwinds. Sequence diagrams draw the value coming back up because
that is how the data travels, not because Express returns it.

Every step page embeds the sequence for its own step. The full set, with the payload at
each hop, is `concepts/sequence.html`.

## Dataflow A — reading from MongoDB

```
GET /products?q=mug
  │
  ▼
routes/productRoutes.js
  │  router.get('/', cache(60), productController.getAll)
  ▼
middlewares/cacheMiddleware.js
  │  key = "__express__/products?q=mug"
  ├── HIT  → res.set('X-Cache','HIT').json(cached)      ← no controller, no Mongo
  └── MISS → next()
  ▼
controllers/productController.js
  │  const products = await productRepository.findAll(req.query)
  ▼
repositories/productRepository.js
  │  Product.find({ title: /mug/i }).sort({ createdAt: 1 })
  ▼
models/product.js  →  MongoDB
  │  documents
  ▼
controller
  │  res.set('X-Total-Count', n).json(products)
  ▼
toJSON transform: _id → id, drop __v  →  JSON
```

Where each failure is handled:

| Failure | Who catches it | What the client sees |
|---|---|---|
| no matching product | controller | `404 { error: { message, status } }` |
| a malformed id | Mongoose `CastError` → error handler | `400` |
| the database is down | rejected promise → `asyncHandler` → error handler | `500`, details only in the log |
| the cache is warm | cache middleware | the old answer until a write clears it |

## Dataflow B — writing

```
POST /products   Bearer …   { title, category, price }
  │
  ▼
requireAuth          jwt.verify(token, ACCESS_TOKEN_SECRET) → req.user
  │                  no token / bad signature → 401, the controller never runs
  ▼
validate(schema)     zod.safeParse(req.body) → clean req.body
  │                  invalid → 400 with details, the controller never runs
  ▼
controller.create    productRepository.create({ ...req.body, createdBy: req.user.id })
  ▼
repository.create    Product.create(data)          ← Mongoose validates again
  ▼
MongoDB              insertOne
  ▼
controller            res.status(201).json(product)  ← clearCache ran before it
```

Why validation happens twice, on purpose:

- **zod at the edge** gives the client a useful `400` with field names, before any
  database work.
- **Mongoose at the model** protects every other caller (a seed script, a future admin
  tool, a test) and enforces the shape that is actually stored.

## Dataflow C — identity

### Register

```
POST /users/register { username, password }
  → findByUsername (a friendly early 409)
  → bcrypt.hash(password, 10)          the plain password is never stored
  → User.create({ username, password: hash })
  → 201 { id, username, role }         password: { select: false }
```

### Login

```
POST /users/login { username, password }
  → findByUsernameWithPassword          .select('+password') is explicit
  → bcrypt.compare(plain, hash)
  → jwt.sign({ id, username, role }, ACCESS_TOKEN_SECRET, 15m)
  → jwt.sign(..., REFRESH_TOKEN_SECRET, 7d)
  → store sha256(refreshToken) on the user
  → 200 { accessToken, refreshToken, user }
```

A missing user and a wrong password return the same `401` and the same message. Any
difference lets an attacker enumerate usernames.

### Authenticated write

```
Authorization: Bearer <accessToken>
  → requireAuth: jwt.verify → req.user = { id, username, role }
  → requireRole('admin') for DELETE
  → the owner check inside update: createdBy === req.user.id, unless role === 'admin'
  → 401 if unknown; 403 if known and refused
```

### Refresh and rotation

```
POST /users/refresh { refreshToken: A }
  → jwt.verify(A, REFRESH_TOKEN_SECRET)
  → findById(payload.id) with +refreshTokenHash
  → sha256(A) === stored hash?          no → 401
  → sign a new access token and a new refresh token B
  → store sha256(B)
  → 200 { accessToken: B, refreshToken: B }
```

The old token A is still a valid JWT — its signature checks out — but its hash no longer
matches. That is revocation without a denylist. A production system would also revoke
the whole token family when an old token is reused; the course names that as the next
step.

## The error path

```
any layer throws
  │
  ├── AppError(message, status, details)
  ├── zod issue        → validate() wraps it in AppError(400)
  ├── CastError        → errorHandler → 400
  ├── ValidationError  → errorHandler → 400, one detail per field
  ├── duplicate 11000  → errorHandler → 409
  └── anything else    → errorHandler → 500 (message hidden in production)
  ▼
{ error: { message, status, details? } }
```

Three pieces make it work:

1. `asyncHandler` turns a rejected promise into `next(err)`. Express 4 does not do this
   for you.
2. `notFound` turns an unmatched route into an `AppError(404)`.
3. The error handler is registered **last** and has four arguments. Any other position or
   signature and it is treated as normal middleware.

## Where does this file go?

| The thing | The home | Because |
|---|---|---|
| `POST /products` and its URL | `routes/productRoutes.js` | a path is a routing fact |
| the 404 for a missing product | `controllers/productController.js` | it is an HTTP answer |
| `{ title: { type: String, required: true } }` | `models/product.js` | the stored shape outlives HTTP |
| `Product.find(filter)` | `repositories/productRepository.js` | only this layer knows the database |
| “who is this Bearer token?” | `middlewares/authMiddleware.js` | it runs before the handler and can stop it |
| “the price must be positive” | `schemas/productSchemas.js` + the model | twice, for two different callers |
| `PORT`, `MONGODB_URI`, secrets | `config/index.js` | one reader, one `.env.example` |
| `_id` → `id` | the model's `toJSON` | the wire shape is a serialisation decision |
| the checkout total | **not here** | the React course owns the cart |

## The five rules, short version

1. **Routes route.** A URL, a verb, the middleware that route needs, the controller that
   answers. No data, no queries.
2. **Controllers speak HTTP.** They read `req`, choose a status and send JSON. They never
   build a query.
3. **Repositories own storage.** Plain values in, documents out. They never see `req`,
   `res` or a status code.
4. **Models describe data.** Types, required fields, indexes, timestamps, the JSON
   transform. They import only Mongoose.
5. **Middleware crosses the edge.** Auth, validation, caching, rate limiting: each runs
   before the handler and can stop it. The order is the behaviour.

## Why the folders appeared in this order

| Step | File that appears | The pain it removed |
|---|---|---|
| 4 | `src/routes/` | every URL in `server.js` |
| 5 | `src/controllers/` | handlers inside the router |
| 6 | `src/repositories/` | data inside the controller |
| 7 | `src/config/database.js` | a connection string inline |
| 8 | `src/models/` | data with no shape or rules |
| 9 | `errors/`, `utils/`, `schemas/`, middlewares | scattered failure handling |
| 11–14 | user files, auth middleware | identity and authorization |
| 15–18 | rate limit, cors, cache middlewares | cross-cutting concerns |
| 19 | `src/config/index.js` | five files reading `process.env` |
| 20 | `src/docs/` | API documentation drifting from the code |
| 21 | `src/app.js`, `test/` | an app that can only run by binding a port |

Nothing was created before it was needed. That is the point of the step order, and it is
why the tree makes sense only at the end.

## What this API deliberately does not have

- **No TypeScript.** The Mongoose schema and the zod schema are the contract.
- **No cookie session.** Tokens travel in the body/header so the room can see them. A
  real browser app would put the refresh token in an HttpOnly cookie.
- **No Redis.** `memory-cache` is enough to teach the invalidation problem; a real cache
  is the same idea with a network in the middle.
- **No queues or background jobs.** Every operation finishes inside the request.
- **No pagination.** `GET /products` returns the whole list. With 10,000 products the
  next step is `?page=&limit=` and a `meta` object, not a bigger server.
- **No deployment.** Step 21 makes the app testable, not deployable. The next step is a
  `Dockerfile`, a `GET /health` probe and a real `MONGODB_URI`.

## The bridge to the React course

This API listens on **8000**, the same port `json-server` used, and it serves the same
product shape (`id`, `title`, `category`, `price`). To replace `json-server` with the
real backend:

1. stop `json-server`;
2. start this API on `:8000` — the React project's Vite proxy already targets that port
   and strips the `/api` prefix;
3. keep the same product shape, which this API already serves.

The React app's `GET /api/products` goes through the Vite proxy and arrives here as
`GET /products`. Everything else — the cards, the cart, the search — keeps working. That
is the payoff of keeping the wire shape stable through eight steps of refactoring.
