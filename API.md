# The API

Base URL: `http://localhost:8000`. Every request and response is JSON unless noted.
The finished API is step 21; earlier steps have fewer routes, and the step page's
**Try it** panel always shows what exists on the current branch.

## Error shape

Every failure, from every layer:

```json
{
  "error": {
    "message": "Validation failed",
    "status": 400,
    "details": [
      { "field": "title", "message": "title is required" }
    ]
  }
}
```

`details` appears only when there is something useful to say. A `500` never leaks a
stack trace; it goes to the server log.

| Status | When |
|---|---|
| `200` | a read or update succeeded |
| `201` | a document was created |
| `204` | a delete succeeded; no body |
| `400` | a bad body, a bad id, a Mongoose validation error |
| `401` | no token, a bad signature, an expired token, bad credentials, a dead refresh token |
| `403` | a valid identity that is not allowed (role or owner) |
| `404` | no product, or no route |
| `409` | a duplicate username |
| `429` | a rate limit |
| `500` | a bug |

## Health

```
GET /health
```

```json
{ "status": "ok", "uptime": 12.34 }
```

## Products

| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| `GET` | `/products?q=&category=` | public | — | `200` + array, `X-Total-Count` |
| `GET` | `/products/:id` | public | — | `200` + product |
| `POST` | `/products` | Bearer | `{ title, category, price, description?, stock? }` | `201` + product |
| `PATCH` | `/products/:id` | Bearer, owner or admin | any subset of the create fields | `200` + product |
| `DELETE` | `/products/:id` | Bearer, role `admin` | — | `204` |

`q` searches title, category and description, case-insensitively. `category` is an exact
match. Both can be combined.

```bash
curl -s 'http://localhost:8000/products?q=mug'
curl -s 'http://localhost:8000/products?category=Home'
curl -s 'http://localhost:8000/products/665f1c2ab7d1e0a4f2c9b111'
```

Create, update and delete need a token. See the auth flow below.

```bash
curl -s -X POST http://localhost:8000/products \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Desk Mat","category":"Desk","price":29,"stock":10}'
```

```bash
curl -s -X PATCH http://localhost:8000/products/665f1c2ab7d1e0a4f2c9b111 \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"price":19.5}'
```

```bash
curl -i -X DELETE http://localhost:8000/products/665f1c2ab7d1e0a4f2c9b111 \
  -H "Authorization: Bearer $TOKEN"
```

A product looks like this. `id` is a string; `_id` and `__v` never leave the server.

```json
{
  "id": "665f1c2ab7d1e0a4f2c9b111",
  "title": "Aero Mug",
  "category": "Kitchen",
  "price": 24,
  "description": "A thin-walled mug that keeps coffee warm for an hour.",
  "stock": 40,
  "createdBy": "665f1c2ab7d1e0a4f2c9b000",
  "createdAt": "2026-01-01T09:00:00.000Z",
  "updatedAt": "2026-01-01T09:00:00.000Z"
}
```

## Auth

### Register

```bash
curl -s -X POST http://localhost:8000/users/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"sam","password":"sam12345"}'
```

`201`:

```json
{ "id": "665f…", "username": "sam", "role": "user" }
```

Rules: username 3–30 characters, letters/numbers/underscore; password at least 8
characters. A duplicate username is `409`. The password hash is `select: false` and is
never serialised.

### Login

```bash
curl -s -X POST http://localhost:8000/users/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

`200`:

```json
{
  "accessToken": "eyJhbGciOi…",
  "refreshToken": "eyJhbGciOi…",
  "user": { "id": "665f…", "username": "admin", "role": "admin" }
}
```

Seeded accounts:

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | admin |
| `demo` | `demo1234` | user |

The access token lasts 15 minutes. Send it as `Authorization: Bearer <token>` on every
protected request.

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/users/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken')

curl -s http://localhost:8000/products \
  -H "Authorization: Bearer $TOKEN"
```

### Refresh

```bash
curl -s -X POST http://localhost:8000/users/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<the refresh token>"}'
```

`200` with a new pair. The refresh token used for the call is now dead: its hash no
longer matches the one stored on the user. Reusing it returns `401`. This is rotation.

### Logout

```bash
curl -i -X POST http://localhost:8000/users/logout \
  -H "Authorization: Bearer $TOKEN"
```

`204`. The stored refresh-token hash is cleared, so the refresh token cannot be used
again. The access token remains valid until it expires; keep it short for that reason.

## Rate limits

| Scope | Window | Max |
|---|---|---|
| the whole API, per IP | 60 s | 100 |
| `POST /users/login`, per IP | 60 s | 5 |

A `429` carries `RateLimit-*` headers and a `Retry-After`. The limiter runs before auth,
validation and the handler, so a flood costs almost nothing.

## Cache

`GET /products` is cached for 60 seconds by full URL. Every response carries `X-Cache:
HIT` or `MISS`. A create, update or delete clears the cache. Query strings are part of
the key, so `?q=mug` and `?q=pot` are cached separately.

## Documentation

- `GET /api-docs` — Swagger UI (development)
- `GET /api-docs.json` — the OpenAPI 3 document

Both are generated from the `@openapi` comments in `src/routes/*.js`.
