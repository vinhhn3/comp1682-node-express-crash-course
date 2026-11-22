#!/usr/bin/env node
/**
 * The concept server. Three jobs, no Express (the app you are building is the
 * Express app; this is the page that follows it):
 *
 *   GET  /concepts/*   the step page, diagrams and deep dives
 *   GET  /__step       which git branch is checked out
 *   GET  /__diff       what changed since the previous step
 *   POST /__call       run one HTTP request against the API and show the reply
 *
 * The last one is why there is no CORS problem on the concept tab: the browser
 * talks to this server, this server talks to the API.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CONCEPTS = path.join(ROOT, 'concepts');
const PORT = Number(process.env.CONCEPT_PORT || 5173);
const API = process.env.API_URL || 'http://127.0.0.1:8000';
const LAST_STEP = 21;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const WATCH_HEADERS = [
  'content-type',
  'x-cache',
  'x-total-count',
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'access-control-allow-methods',
  'ratelimit-limit',
  'ratelimit-remaining',
  'ratelimit-reset',
  'retry-after',
  'www-authenticate',
  'location',
];

function git(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function readBranch() {
  try {
    const head = fs.readFileSync(path.join(ROOT, '.git/HEAD'), 'utf8').trim();
    return head.startsWith('ref: ') ? head.slice('ref: refs/heads/'.length) : 'detached';
  } catch {
    return 'detached';
  }
}

function branchFor(n) {
  const prefix = `s${String(n).padStart(2, '0')}-`;
  return git(`git branch --list "${prefix}*" --format="%(refname:short)"`).split('\n')[0];
}

function stepOf(branch) {
  if (branch === 'main') return LAST_STEP;
  const match = branch.match(/^s(\d\d)-/);
  return match ? Number(match[1]) : null;
}

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function serveStatic(pathname, res) {
  let file = path.normalize(path.join(ROOT, pathname));

  if (pathname === '/concepts/' || pathname === '/concepts') {
    pathname = '/concepts/index.html';
    file = path.join(CONCEPTS, 'index.html');
  }

  if (!file.startsWith(CONCEPTS + path.sep) && file !== path.join(CONCEPTS, 'index.html')) {
    return json(res, 404, { error: 'Not found' });
  }

  fs.readFile(file, (err, data) => {
    if (err) return json(res, 404, { error: `No such file: ${pathname}` });
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}

/* ── tokens for the "as admin" buttons ──────────────────────────────── */

const tokenCache = new Map();
const CREDENTIALS = {
  admin: { username: 'admin', password: 'admin123' },
  demo: { username: 'demo', password: 'demo1234' },
};

async function login(who) {
  const creds = CREDENTIALS[who];
  if (!creds) throw new Error(`Unknown user "${who}"`);

  const res = await fetch(`${API}/users/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(creds),
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || data?.error || `login failed (${res.status})`;
    throw new Error(`${message} — is step 12 (JWT) checked out?`);
  }

  return data;
}

async function tokenFor(who) {
  const hit = tokenCache.get(who);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.token;

  const data = await login(who);
  const token = data.accessToken || data.token;
  if (!token) throw new Error('login returned no accessToken');
  tokenCache.set(who, { token, at: Date.now() });
  return token;
}

async function firstProductId() {
  const res = await fetch(`${API}/products`, { signal: AbortSignal.timeout(3000) });
  const data = await res.json().catch(() => []);
  const list = Array.isArray(data) ? data : data.data || [];
  return list.length ? list[0].id || list[0]._id : null;
}

async function lastProductId() {
  const res = await fetch(`${API}/products`, { signal: AbortSignal.timeout(3000) });
  const data = await res.json().catch(() => []);
  const list = Array.isArray(data) ? data : data.data || [];
  return list.length ? list[list.length - 1].id || list[list.length - 1]._id : null;
}

async function resolvePath(input) {
  let p = input;
  if (p.includes('{id}')) {
    const id = await firstProductId();
    p = p.replaceAll('{id}', id || 'missing');
  }
  if (p.includes('{lastId}')) {
    const id = await lastProductId();
    p = p.replaceAll('{lastId}', id || 'missing');
  }
  return p;
}

/* ── one call ───────────────────────────────────────────────────────── */

async function oneCall(spec) {
  const {
    method = 'GET',
    path: rawPath = '/',
    body,
    headers = {},
    as,
  } = spec;

  const target = await resolvePath(rawPath);
  const url = `${API}${target.startsWith('/') ? target : `/${target}`}`;
  const outHeaders = { accept: 'application/json', ...headers };
  let payload;

  if (as) {
    const token = await tokenFor(as);
    outHeaders.authorization = `Bearer ${token}`;
  }

  /* The refresh demo needs a fresh refresh token every time, because rotation
     invalidates the previous one. So log in right here instead of using the cache. */
  if (target.startsWith('/users/refresh') && !body?.refreshToken) {
    const session = await login('demo');
    payload = JSON.stringify({ refreshToken: session.refreshToken });
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
  }

  if (payload !== undefined) outHeaders['content-type'] = 'application/json';

  const started = performance.now();
  const response = await fetch(url, {
    method,
    headers: outHeaders,
    body: payload,
    signal: AbortSignal.timeout(8000),
  });
  const ms = Math.round(performance.now() - started);
  const text = await response.text();

  let parsed = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* keep the raw text */
  }

  const shown = {};
  for (const name of WATCH_HEADERS) {
    const value = response.headers.get(name);
    if (value) shown[name] = value;
  }

  return {
    request: { method, path: target, as: as || null, headers: outHeaders, body: payload ? JSON.parse(payload) : null },
    status: response.status,
    statusText: response.statusText,
    headers: shown,
    body: parsed,
    ms,
    size: Buffer.byteLength(text),
  };
}

function curlFor(result) {
  const { request } = result;
  const bits = [`curl -i -X ${request.method}`, `'${API}${request.path}'`];
  if (request.headers.authorization) bits.push(`-H 'Authorization: ${request.headers.authorization}'`);
  if (request.body) bits.push(`-H 'Content-Type: application/json'`, `-d '${JSON.stringify(request.body)}'`);
  return bits.join(' ');
}

async function handleCall(req, res) {
  let spec;
  try {
    spec = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: 'Expected a JSON body' });
  }

  const repeat = Math.min(Math.max(Number(spec.repeat) || 1, 1), 10);

  try {
    if (repeat === 1) {
      const result = await oneCall(spec);
      return json(res, 200, { ...result, curl: curlFor(result) });
    }

    const runs = [];
    for (let i = 0; i < repeat; i += 1) {
      try {
        const result = await oneCall(spec);
        runs.push({ status: result.status, statusText: result.statusText, ms: result.ms });
      } catch (err) {
        runs.push({ status: 0, statusText: err.message, ms: 0 });
      }
    }
    return json(res, 200, { runs, repeat });
  } catch (err) {
    const unreachable = /fetch failed|ECONNREFUSED|timed out/i.test(err.message);
    return json(res, 200, {
      status: 0,
      statusText: unreachable ? 'API not reachable' : err.message,
      error: unreachable
        ? `Nothing answered on ${API}. Is npm run dev running?`
        : err.message,
      headers: {},
      body: null,
      ms: 0,
    });
  }
}

/* ── server ─────────────────────────────────────────────────────────── */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/' || pathname === '') {
    res.writeHead(302, { Location: '/concepts/step.html' });
    return res.end();
  }

  if (pathname === '/__step') {
    const branch = readBranch();
    return json(res, 200, { branch, step: stepOf(branch) });
  }

  if (pathname === '/__diff') {
    const requested = url.searchParams.get('step');
    let n;
    let to;
    let branch = readBranch();

    if (requested !== null) {
      n = Number(requested);
      to = branchFor(n);
    } else {
      to = branch === 'main' ? `s${String(LAST_STEP).padStart(2, '0')}-` : branch;
      if (to.endsWith('-')) to = git(`git branch --list "${to}*" --format="%(refname:short)"`).split('\n')[0];
      n = stepOf(to);
    }

    const from = Number.isInteger(n) && n > 0 ? branchFor(n - 1) : '';
    const range = from ? `${from} ${to}` : '';
    const raw = range ? git(`git diff --no-color -M ${range} -- server.js src test`) : '';
    const stat = range ? git(`git diff --stat -M ${range} -- server.js src test`) : '';

    return json(res, 200, { from, to, raw, stat });
  }

  if (pathname === '/__health') {
    try {
      let ping = await fetch(`${API}/health`, { signal: AbortSignal.timeout(800) });
      if (ping.status === 404) ping = await fetch(`${API}/products`, { signal: AbortSignal.timeout(800) });
      return json(res, 200, { api: ping.status < 500, status: ping.status, url: API });
    } catch {
      return json(res, 200, { api: false, status: 0, url: API });
    }
  }

  if (pathname === '/__call' && req.method === 'POST') {
    return handleCall(req, res);
  }

  if (pathname.startsWith('/concepts/')) {
    return serveStatic(pathname, res);
  }

  return json(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`\n  CONCEPT  http://localhost:${PORT}/concepts/step.html`);
  console.log(`  API      ${API}`);
  console.log(`  branch   ${readBranch()}\n`);
});
