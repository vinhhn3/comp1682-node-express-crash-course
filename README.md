# Shop API — a Node/Express crash course, built one small step at a time

Twenty-two versions of the same small backend. Each branch adds **one** thing and is
small enough to read in a minute. It is the API the React crash course consumed: same
products, same shape, same port — now built from `http.createServer` to a layered,
tested Express service.

```
npm install
npm run dev        # MongoDB (in memory) + the API on :8000
npm run concept    # the concept tab on :5173
```

```
npm run step       # list the steps
npm run step 13    # jump to step 13
```

The API keeps running when you switch branches; nodemon reloads it.

## Three zones

| Zone | Where | What it is for |
|---|---|---|
| **CODE** | VS Code | the branch |
| **API** | `http://localhost:8000` | the running server |
| **CONCEPT** | `http://localhost:5173/concepts/step.html` | the explanation for the current step |

The concept page asks the concept server which branch is checked out, so
`npm run step 5` changes the code and the explanation together. The explanation —
the idea, a plain-language sequence diagram, the relevant tables from the deep pages,
inline JWT / rotation / CORS / middleware demos, and a live **Try it** panel — is on
the step page itself. Nothing to open in another tab.

Start with [`START-HERE.md`](START-HERE.md); the minute-by-minute script is
[`docs/run-sheet.md`](docs/run-sheet.md).

| # | Branch | The one thing it teaches |
|---|---|---|
| 0 | `s00-raw-http` | `http.createServer`, one route, every header yours |
| 1 | `s01-express` | `app.get`, `res.json`, what Express removes |
| 2 | `s02-one-file` | a second route, `:id`, all in `server.js` |
| 3 | `s03-json-body` | `express.json`, `req.body`, `POST` |
| 4 | `s04-routers` | `express.Router`, mounting, the first boundary |
| 5 | `s05-controllers` | handlers move to `controllers/` |
| 6 | `s06-repositories` | data access moves to `repositories/` |
| 7 | `s07-mongo-connect` | Mongoose connects at boot, fails loudly |
| 8 | `s08-model` | schema, timestamps, `_id` → `id`, the repository swap |
| 9 | `s09-errors` | `AppError`, `asyncHandler`, zod, one error handler |
| 10 | `s10-update-delete` | `PATCH`, `DELETE`, `204`, `runValidators` |
| 11 | `s11-users` | user model, bcrypt, `select: false`, `409` |
| 12 | `s12-jwt` | login, `bcrypt.compare`, sign a claim |
| 13 | `s13-auth-middleware` | `requireAuth`, `req.user`, `401` vs `403`, ownership |
| 14 | `s14-refresh-token` | two lifetimes, hash at rest, rotation, revocation |
| 15 | `s15-rate-limit` | `429` before the handler, a stricter login door |
| 16 | `s16-cors` | preflight, allowlist, why curl works |
| 17 | `s17-cache` | cache by URL, `X-Cache`, stale after a write |
| 18 | `s18-cache-invalidation` | the writer clears the cache |
| 19 | `s19-config` | one reader of `process.env`, validated at boot |
| 20 | `s20-swagger` | OpenAPI from JSDoc, `/api-docs` |
| 21 | `s21-tests` | `app.js` without a port, supertest, ten tests |

`main` = step 21.

## The architecture, in one picture

```
Browser
  │  GET /products?q=mug
  ▼
routes/            URL + verb → which middleware and controller
  ▼
middlewares/       auth, validate, cache, rate limit — can stop the request
  ▼
controllers/       req/res in, status + JSON out; no queries
  ▼
repositories/      the only code that touches a model
  ▼
models/            Mongoose schema; the shape and its rules
  ▼
MongoDB
```

The **[architecture notes](ARCHITECTURE.md)** are the ending: the tree, the import
rules, three data flows, and the "where does this file go" table. In the browser,
[`concepts/folders.html`](concepts/folders.html) draws the tree and
[`concepts/sequence.html`](concepts/sequence.html) animates the data at every hop.
Every step page also embeds the part that belongs to that step.

## Demo notes

- **Credentials** (seeded): `admin` / `admin123` (admin), `demo` / `demo1234` (user).
- `npm run dev` starts a real MongoDB in memory on `127.0.0.1:27017`, seeds it once, and
  runs nodemon. The first run downloads the MongoDB binary (~60 MB). All data is lost on
  Ctrl-C, which is exactly what a class wants.
- Have your own MongoDB? Set `MONGODB_URI` in `.env` and `npm run dev` will not start one.
  `npm run db` gives you the database in its own terminal instead.
- The API listens on **8000**, the same port the React course's `json-server` used. The
  product shape is the same too (`id`, `title`, `category`, `price`), so pointing the
  React app's Vite proxy at this API replaces `json-server` with the real thing.
- `npm run seed` wipes and reseeds. `npm test` runs the ten final tests.
- The concept server is plain Node (`scripts/concept-server.mjs`), not Express. The app
  you are building is the Express app; the page that follows it should not depend on it.

## What this course deliberately does not have

- **TypeScript.** The Mongoose schema and the zod schema are the contract.
- **A cookie-based session.** Tokens travel in the body/header so you can see them.
- **A real cache server.** `memory-cache` is enough to teach invalidation.
- **Deployment.** The last step makes the app testable, not deployable.
- **A frontend.** The React crash course is the frontend; this is what it talks to.
