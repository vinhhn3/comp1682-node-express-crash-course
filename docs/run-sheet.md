# Run sheet — 180 minutes, 22 steps

Setup: two terminals (`npm run dev`, `npm run concept`), one browser window with the
concept tab. Every `npm run step N` moves the code, the API and the explanation.

**Rules**
- Six minutes per step, not twelve. If a step runs long, cut the demo, not the next step.
- Ask the question on the step page, wait three seconds, then answer it.
- Never type a long block. The branch already has the code; type the one-line delta.
- Say the step number out loud. "We are on step six" keeps the room oriented.
- **The explanation is on the step page.** Do not open another tab. Point at the
  **In depth** section: the idea, the flow, the sequence, the payloads.
- **End every step on the diff card.** Read the summary line first, then the red line and
  the green line beside it. The diagram explains it; the diff proves it.

| Time | Step | Branch |
|---|---|---|
| 0:00–0:08 | three zones | — |
| 0:08–0:14 | 0 | `s00-raw-http` |
| 0:14–0:20 | 1 | `s01-express` |
| 0:20–0:26 | 2 | `s02-one-file` |
| 0:26–0:32 | 3 | `s03-json-body` |
| 0:32–0:38 | 4 | `s04-routers` |
| 0:38–0:44 | 5 | `s05-controllers` |
| 0:44–0:50 | 6 | `s06-repositories` |
| 0:50–0:56 | 7 | `s07-mongo-connect` |
| 0:56–1:02 | 8 | `s08-model` |
| 1:02–1:08 | 9 | `s09-errors` |
| 1:08–1:14 | 10 | `s10-update-delete` |
| 1:14–1:20 | 11 | `s11-users` |
| 1:20–1:26 | 12 | `s12-jwt` |
| 1:26–1:32 | 13 | `s13-auth-middleware` |
| 1:32–1:38 | 14 | `s14-refresh-token` |
| 1:38–1:44 | 15 | `s15-rate-limit` |
| 1:44–1:50 | 16 | `s16-cors` |
| 1:50–1:56 | 17 | `s17-cache` |
| 1:56–2:02 | 18 | `s18-cache-invalidation` |
| 2:02–2:08 | 19 | `s19-config` |
| 2:08–2:14 | 20 | `s20-swagger` |
| 2:14–2:24 | 21 | `s21-tests` |
| 2:24–2:34 | break | — |
| 2:34–2:44 | architecture recap | folders + sequence |
| 2:44–3:00 | questions, buffer | — |

---

## 0:00–0:08 · The three zones

No code. Point at the three windows.

> "Code, API, explanation. One command moves all three. You will never see a slide."

Open the step page. Point at **In depth**: "the idea, the data and the sequence are
here, on the same page. We do not navigate during this course."

`npm run step 0`.

---

## 0:08–0:14 · `s00` a raw server

Show `http.createServer`. It takes one function. That function runs for every request.

> "Node gives you a method, a URL, some headers and a stream. It gives you nothing else."

Press **GET the list**, then **GET something that is not there**. Point at the status,
the `Content-Type`, the JSON body.

Ask: **"Where does the 200 come from?"** Answer: you wrote it. In the next step, Express
will write less of it for you, but it will never write the answer.

---

## 0:14–0:20 · `s01` Express

Show `app.get`. One line replaces the `if`.

> "Express is a router and a queue. A route is a method, a path and a function."

Press **The health check** and **The product list**.

Ask: **"What did Express remove? What is still your job?"** Answer: the branch and the
headers. Writing the body and choosing the status are still yours.

---

## 0:20–0:26 · `s02` one file

Press **One product by id**, then **An id that does not exist**.

> "A second route needs a parameter. A missing one is not an empty 200; it is a 404."

Ask: **"Now add POST. How many lines does server.js become?"** Answer: too many, and the
data is already in the wrong place.

---

## 0:26–0:32 · `s03` the body

Press **Create a product**, then **Create one with a string price**.

> "The body is a stream. express.json collects it and parses it. After that, req.body is
> an object — and the rules are yours."

Ask: **"Who checked the price?"** Answer: a hand-written `typeof`. It already has three
jobs and will grow one per field. Step 9 replaces it with a schema.

---

## 0:32–0:38 · `s04` the router

Show the new `src/routes/productRoutes.js` and the one mount in `server.js`.

> "A router is a mini-app with its own paths. server.js is becoming a list of mounts."

Ask: **"The router owns the data now too. Is that its job?"** Answer: no. The URL moved
to the right place; the array came along by accident.

Read the `tree` block and the **knows / must not know** table on the step page.

---

## 0:38–0:44 · `s05` the controller

Show the route file: six lines, each a path + a controller name.

> "A controller owns the HTTP conversation: read the request, choose a status, send JSON."

Ask: **"Who owns the array now?"** Answer: the controller. Still wrong, one layer lower.

---

## 0:44–0:50 · `s06` the repository

Show `productRepository.js` and the controller call.

> "The controller asks for products. It does not know whether they come from an array,
> a file or a database."

Ask: **"Swap the array for a database. Which files change?"** Answer: the repository, and
nothing above it. Write that answer on the board; step 8 collects it.

---

## 0:50–0:56 · `s07` connect

Show `src/config/database.js` and `start()`.

> "The database is an external dependency. Connect once, before listen. If it fails, exit."

Ask: **"Why not start the server and connect in the background?"** Answer: every request
would need to handle "not connected" forever. A server with a broken database is worse
than a server that is down.

Press **Products still come from the array** — the connection is open, but unused.

---

## 0:56–1:02 · `s08` the model and the swap

This is the payoff step. Show the schema, then the repository diff. The controller is
untouched.

> "One file changed below the boundary, and the API stayed the same. That is why we spent
> three steps on the boundary."

Open **In depth** and press **Play** on the read sequence. Point at each hop: query in,
documents back, `_id` → `id` in `toJSON`.

Ask: **"The controller did not change. What does that tell you?"**

---

## 1:02–1:08 · `s09` errors

Press, in order: no title, negative price, bad id, unknown route.

> "An error is data too. One handler, one shape, every failure."

Open the error sequence. Point at the jump from `validate` to `errorHandler`: the
controller is skipped.

Ask: **"Delete the asyncHandler from one route. What does the client see when Mongo
throws?"** Answer: nothing, until the timeout; the server logs an unhandled rejection.

---

## 1:08–1:14 · `s10` update and delete

Press **Change one price**, then **Delete a product**, then **Ask for it again**.

> "PATCH sends only what changed. DELETE answers 204, and the second DELETE is a 404."

Ask: **"Anyone can delete any product. What is missing, and where does it belong?"**
Answer: identity and policy. Not in the model; at the edge, before the handler. Steps
11–13.

---

## 1:14–1:20 · `s11` users

Press **Register a user**, then the same request again.

> "A user is a document with a secret field. Hash it before it is stored, and never send
> it back."

Open the register sequence. Point at bcrypt and at `select: false`.

Ask: **"What must never travel back to the client?"** Answer: the hash, and the plain
password. The response has neither.

---

## 1:20–1:26 · `s12` login and JWT

Press **Log in as admin**, then the wrong password.

> "A JWT is three base64 parts. The payload is readable; the signature is the proof."

Open the login sequence. Point at the password lookup, the comparison and the signature. Do not
name methods; the sequence is in plain words on purpose.

Ask: **"Which part proves it was not edited?"** Answer: the signature. The payload is
just base64, not encryption.

---

## 1:26–1:32 · `s13` the front door

Press **Create with no token** (401), **Create as demo** (201), **Demo deletes it** (403),
**Admin deletes it** (204).

> "401 is 'who are you?'. 403 is 'I know, and no'."

Open the create sequence. Point at the token check, the body check, and the controller that only runs after both.

Ask: **"A valid token for demo, a product owned by admin. Which status?"** Answer: 403.
The identity is known; the permission is not there.

---

## 1:32–1:38 · `s14` two tokens

Press **Rotate a refresh token**. It logs in as demo, spends the refresh token, and gets a
new pair. Then open **In depth**: play the refresh sequence, then the reuse sequence.

> "The old token is still a valid JWT. Its signature checks out. It is refused because
> its hash no longer matches the one stored on the user."

Ask: **"Why is the reused refresh token a 401 and not a 403?"** Answer: it is no longer a
credential. 403 would mean a known identity was refused; this token is not known any more.

---

## 1:38–1:44 · `s15` rate limit

Press **Six bad logins**. Read the six statuses out loud: five 401s, then a 429.

Play the **limit** sequence: point at the limiter, then at the handler that never runs.

> "The limiter runs before auth, validation and the handler. A flood costs almost nothing."

Ask: **"Which runs first: the limiter or the auth check? Why?"** Answer: the limiter,
because it is cheaper and it protects the auth check too.

---

## 1:44–1:50 · `s16` CORS

Press **An allowed origin**, then **An origin that is not on the list**. Point at
`access-control-allow-origin` in the headers.

Play the **preflight** sequence: the browser asks, then sends the real request.

> "CORS is a response header checked by the browser. curl never asks."

Ask: **"Why does curl work?"** Answer: there is no browser to enforce the policy. The
server answered both times.

---

## 1:50–1:56 · `s17` cache

Press **First read** (MISS), **Second read** (HIT), **Create a product**, **Read again**.
The new product is missing.

Play the **cache read** sequence: name the answer stored on the way out, and the
second request that stops at the cache.

> "The second read never touches Mongo. That is the point, and the problem."

Ask: **"How long is the list wrong?"** Answer: 60 seconds, or until something clears the
cache. The next step is that something.

---

## 1:56–2:02 · `s18` invalidation

Press **Create a product**, then **Read the list**. MISS, and the product is there.

Play the **cache write** sequence: the save, the clear, then the read that rebuilds it.

> "The writer clears the cache. A cache is correct only if every write invalidates it."

Ask: **"cache.clear() clears every URL. When is that too blunt?"** Answer: when there is
traffic. Then key by URL prefix and clear the smallest safe prefix.

---

## 2:02–2:08 · `s19` config

Show `src/config/index.js`. Run `grep -rn "process.env" src` on the before and after
(live, if the room is with you). Play the **config** sequence: one read, handed down.

> "One file reads the environment. Everything else asks config. Production refuses the
> development secrets."

Ask: **"How many answers before and after?"** Answer: five files, one file.

---

## 2:08–2:14 · `s20` Swagger

Open `http://localhost:8000/api-docs`. Point at the product routes and the bearer scheme.
Play the **docs** sequence: comment → document → page.

> "The docs are a comment beside the route. Drift shows up in the same diff."

Ask: **"What happens when the route changes and the comment does not?"** Answer: the docs
lie. That is why the comment lives in the same file and the same review.

---

## 2:14–2:24 · `s21` tests and the whole picture

Show `src/app.js` and `server.js`: the app without a port.

> "app.listen is a deployment detail. The app is the thing under test."

Run `npm test`. Ten tests. Let the room read the names.

Then open **In depth** and play the **test** sequence.

Ask: **"The app never calls listen in a test. Why is that the point?"** Answer: no port,
no network, no open handle; a test can run beside another test.

---

## 2:24–2:34 · Break

Leave the concept tab on step 21.

---

## 2:34–2:44 · The architecture recap

No code. Three pages, ten minutes.

1. **`concepts/folders.html`** — the tree with a job on every folder. Walk the import
   matrix. Point at `models/ → mongoose only`. Ask: "where would a currency formatter
   go?" Answer: `utils/` — no HTTP, no database.
2. **`concepts/sequence.html`** — play **read**, then **create**, then **reuse old
   token**. Point at the payload at each hop, not the arrows.
3. **`concepts/layers.html`** — click controllers, then repositories. Read out the
   "must not know" lists.

Then the sentence to leave them with:

> "The framework is the easy part. The architecture is knowing which file is allowed to
> know what."

---

## 2:44–3:00 · Questions and buffer

Likely questions:

| Question | Short answer |
|---|---|
| Why not put the query in the controller? | Then a cache, a second caller or a test has to fake HTTP. |
| Why 400 and not 422? | 422 is for semantic errors in some APIs; 400 is fine and simpler. Pick one and be consistent. |
| Why not cookies? | The room can see a header and a body. A production SPA would put the refresh token in an HttpOnly cookie. |
| Why is the access token 15 minutes? | A balance: long enough to be usable, short enough that a stolen one expires. |
| Why store the refresh token hash? | So the server can revoke it. A JWT alone cannot be revoked. |
| Why `memory-cache` and not Redis? | The lesson is invalidation, not the network. The interface is the same. |
| Why does the cache clear everything? | Correct before clever. Prefix invalidation is the optimisation. |
| Why no pagination? | Out of scope; `?page=&limit=` and a `meta` object is the next step. |
| Why no TypeScript? | The schemas are the contract. Types would formalise the same shape. |
| Why is the test database in memory? | Fast, disposable, real Mongoose. Same tests, no cleanup script. |
