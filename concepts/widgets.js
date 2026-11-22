/* Interactive pieces that used to live only on the deep pages. The step page
   mounts them inline, so the explanation and the demonstration are together. */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function call(method, path, body, as, headers = {}) {
  return fetch('/__call', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ method, path, body, as, headers }),
  }).then((res) => res.json());
}

function statusChip(status, text) {
  const cls = !status ? 'err' : status < 300 ? 'ok' : status < 500 ? 'warn' : 'err';
  return `<span class="status ${cls}">${status || 'ERR'} ${esc(text || '')}</span>`;
}

function b64url(part) {
  const pad = part.replace(/-/g, '+').replace(/_/g, '/');
  const text = decodeURIComponent(
    atob(pad + '='.repeat((4 - (pad.length % 4)) % 4))
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
  return JSON.parse(text);
}

/* ── JWT inspector ──────────────────────────────────────────────────── */

function initJwt(root) {
  root.innerHTML = `
    <div class="btns">
      <button class="btn pri" data-who="admin">Log in as admin</button>
      <button class="btn" data-who="demo">Log in as demo</button>
    </div>
    <div class="widget-out"><p class="resp-meta" style="margin:0">Log in to get a real token from this API.</p></div>
  `;

  const out = root.querySelector('.widget-out');

  root.querySelectorAll('[data-who]').forEach((button) => {
    button.onclick = async () => {
      const who = button.dataset.who;
      out.innerHTML = '<p class="resp-meta" style="margin:0">logging in…</p>';

      const data = await call('POST', '/users/login', {
        username: who === 'admin' ? 'admin' : 'demo',
        password: who === 'admin' ? 'admin123' : 'demo1234',
      });

      if (!data.body?.accessToken) {
        out.innerHTML = `<p class="note bad" style="margin:0">${esc(
          data.error || data.body?.error?.message || `login failed (${data.status})`,
        )} — is step 12 checked out?</p>`;
        return;
      }

      const token = data.body.accessToken;
      const [header, payload, signature] = token.split('.');
      let head;
      let body;
      try {
        head = b64url(header);
        body = b64url(payload);
      } catch {
        out.innerHTML = '<p class="note bad" style="margin:0">This token could not be decoded.</p>';
        return;
      }

      const expires = body.exp ? new Date(body.exp * 1000).toLocaleTimeString() : '—';

      out.innerHTML = `
        <div class="dg-seg" style="margin-top:10px;width:100%;overflow:auto">
          <span class="s1" style="flex:0 0 auto">${esc(header)}</span>
          <span class="s2" style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis">${esc(payload)}</span>
          <span class="s3" style="flex:0 0 auto">${esc(signature.slice(0, 14))}…</span>
        </div>
        <p class="resp-meta">three parts, two dots · expires at ${esc(expires)} · role: ${esc(body.role || '—')}</p>
        <div class="grid2">
          <div>
            <span class="dg-cap">header · read it</span>
            <pre class="resp-json" style="margin-top:4px">${esc(JSON.stringify(head, null, 2))}</pre>
          </div>
          <div>
            <span class="dg-cap">payload · read it, do not trust it</span>
            <pre class="resp-json" style="margin-top:4px">${esc(JSON.stringify(body, null, 2))}</pre>
          </div>
        </div>
        <p class="note" style="margin-top:10px">The signature is the only part the client cannot produce. Change one character of the payload and the server refuses the token.</p>
      `;
    };
  });
}

/* ── Refresh rotation ──────────────────────────────────────────────── */

function initRotate(root) {
  root.innerHTML = `
    <div class="btns"><button class="btn pri">Rotate twice</button></div>
    <div class="widget-out"><p class="resp-meta" style="margin:0">Log in, refresh with the new token, then try the old one again.</p></div>
  `;

  const out = root.querySelector('.widget-out');

  root.querySelector('button').onclick = async () => {
    out.innerHTML = '<p class="resp-meta" style="margin:0">running…</p>';

    const first = await call('POST', '/users/login', { username: 'demo', password: 'demo1234' });
    if (!first.body?.refreshToken) {
      out.innerHTML = `<p class="note bad" style="margin:0">Login did not return a refresh token — is step 14 checked out?</p>`;
      return;
    }

    const oldToken = first.body.refreshToken;
    const second = await call('POST', '/users/refresh', { refreshToken: oldToken });
    const newToken = second.body?.refreshToken;
    const third = await call('POST', '/users/refresh', { refreshToken: oldToken });

    const row = (n, label, status, note) => `
      <div class="try" style="grid-template-columns:28px 1fr auto">
        <span class="dg-chip" style="justify-self:center">${n}</span>
        <div class="what">${esc(label)}${note ? `<small>${esc(note)}</small>` : ''}</div>
        ${statusChip(status, '')}
      </div>`;

    out.innerHTML = `
      ${row(1, 'Logged in', first.status, 'refresh token A')}
      ${row(2, 'Refreshed with A', second.status, newToken ? 'a new pair; token B' : 'no new token')}
      ${row(3, 'Tried A again', third.status, 'the stored fingerprint moved to B')}
      <p class="note ${third.status === 401 ? 'good' : 'bad'}" style="margin-top:10px">
        ${third.status === 401
          ? '<strong>Refused.</strong> One refresh token, one use. A stolen token is worth a single attempt.'
          : `Expected 401 for the reused token, got ${third.status}.`}
      </p>
    `;
  };
}

/* ── CORS ──────────────────────────────────────────────────────────── */

function initCors(root) {
  root.innerHTML = `
    <div class="btns">
      <button class="btn pri" data-cors="direct">Fetch from this page</button>
      <button class="btn" data-cors="allowed">Server view · allowed</button>
      <button class="btn" data-cors="evil">Server view · evil</button>
      <button class="btn" data-cors="preflight">Send the preflight</button>
    </div>
    <div class="widget-out"><p class="resp-meta" style="margin:0">This page is :5173. The API is :8000. Press the first button.</p></div>
  `;

  const out = root.querySelector('.widget-out');

  root.querySelectorAll('[data-cors]').forEach((button) => {
    button.onclick = async () => {
      const kind = button.dataset.cors;
      out.innerHTML = '<p class="resp-meta" style="margin:0">working…</p>';

      if (kind === 'direct') {
        try {
          const res = await fetch('http://localhost:8000/products');
          const text = await res.text();
          out.innerHTML = `<p>${statusChip(res.status, res.statusText)} <span class="resp-meta">the browser read ${text.length} bytes</span></p>
            <p class="note good" style="margin-top:8px">The response carried an allow-origin header, so the page can read it.</p>`;
        } catch (err) {
          out.innerHTML = `<p>${statusChip(0, 'blocked')}</p>
            <pre class="resp-json" style="margin-top:8px">${esc(err.message)}</pre>
            <p class="note bad" style="margin-top:8px">The network tab shows a response. JavaScript never sees it: the allow-origin header is missing (or the API is down).</p>`;
        }
        return;
      }

      if (kind === 'preflight') {
        const data = await call('OPTIONS', '/products', undefined, undefined);
        out.innerHTML = `<p>${statusChip(data.status, data.statusText)} <span class="resp-meta">OPTIONS /products</span></p>
          <dl class="resp-head">${Object.entries(data.headers || {})
            .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
            .join('')}</dl>`;
        return;
      }

      const origin = kind === 'allowed' ? 'http://localhost:5173' : 'https://evil.example';
      const data = await call('GET', '/products', undefined, undefined, { Origin: origin });
      const acao = data.headers?.['access-control-allow-origin'];
      out.innerHTML = `<p>${statusChip(data.status, data.statusText)} <span class="resp-meta">Origin: ${esc(origin)}</span></p>
        <dl class="resp-head">
          <dt>allow-origin</dt><dd>${acao ? esc(acao) : '— not sent —'}</dd>
          <dt>allow-credentials</dt><dd>${esc(data.headers?.['access-control-allow-credentials'] || '—')}</dd>
        </dl>
        <p class="note ${acao ? 'good' : 'bad'}" style="margin-top:8px">${acao ? 'A browser would allow this page to read the body.' : 'No allow-origin header: a browser would block the body.'}</p>`;
    };
  });
}

/* ── Middleware order ──────────────────────────────────────────────── */

const CHAIN_SCENARIOS = {
  good: { label: 'good request', token: true, body: true, limit: true },
  noToken: { label: 'no token', token: false, body: true, limit: true },
  badBody: { label: 'bad body', token: true, body: false, limit: true },
  overLimit: { label: 'over the limit', token: true, body: true, limit: false },
};

function initChain(root) {
  root.innerHTML = `
    <div class="btns" style="margin-bottom:10px">
      ${Object.entries(CHAIN_SCENARIOS)
        .map(
          ([key, value]) =>
            `<button class="btn${key === 'good' ? ' on' : ''}" data-scenario="${key}">${esc(value.label)}</button>`,
        )
        .join('')}
    </div>
    <div class="chain"></div>
    <div class="widget-out"></div>
  `;

  const chain = root.querySelector('.chain');
  const out = root.querySelector('.widget-out');

  const row = (name, detail, state, why) => `
    <div class="node ${state}">
      <span class="dg-chip" style="font-size:9.5px">${state === 'skipped' ? 'skip' : 'run'}</span>
      <span>${esc(name)}<small>${esc(detail)}</small></span>
      <span class="why">${esc(why || '')}</span>
    </div>`;

  const draw = (key) => {
    const s = CHAIN_SCENARIOS[key];

    root.querySelectorAll('[data-scenario]').forEach((b) => {
      b.classList.toggle('on', b.dataset.scenario === key);
    });

    let stopped = null;
    const rows = [];

    rows.push(row('rate limit', 'counts per minute', s.limit ? 'on' : 'stop', s.limit ? 'under the limit' : '429'));
    if (!s.limit) stopped = { status: 429, message: 'Too many requests' };

    rows.push(row('cors', 'origin allowlist', stopped ? 'skipped' : 'on', stopped ? 'never reached' : 'origin allowed'));
    rows.push(row('express.json', 'reads the body', stopped ? 'skipped' : 'on', stopped ? 'never reached' : 'req.body ready'));

    rows.push(row('auth check', 'who is this?', stopped ? 'skipped' : s.token ? 'on' : 'stop', stopped ? 'never reached' : s.token ? 'req.user set' : '401'));
    if (!s.token && !stopped) stopped = { status: 401, message: 'Missing Bearer token' };

    rows.push(row('body check', 'fields valid?', stopped ? 'skipped' : s.body ? 'on' : 'stop', stopped ? 'never reached' : s.body ? 'clean' : '400'));
    if (!s.body && !stopped) stopped = { status: 400, message: 'Validation failed' };

    rows.push(row('controller', 'does the work', stopped ? 'skipped' : 'on', stopped ? 'never called' : '201'));
    rows.push(row('error handler', 'one exit', stopped ? 'on' : 'skipped', stopped ? 'formats the failure' : 'not needed'));

    chain.innerHTML = rows.join('');

    out.innerHTML = stopped
      ? `<p>${statusChip(stopped.status, '')} <span class="resp-meta">${esc(stopped.message)}</span></p>
         <p class="note" style="margin-top:8px">The request stopped at the first check that said no. Everything below it never ran.</p>`
      : `<p>${statusChip(201, 'Created')} <span class="resp-meta">the handler ran</span></p>
         <p class="note good" style="margin-top:8px">The request passed every check. The handler is the only box that does the work.</p>`;
  };

  root.querySelectorAll('[data-scenario]').forEach((button) => {
    button.onclick = () => draw(button.dataset.scenario);
  });

  draw('good');
}

/* ── mount ─────────────────────────────────────────────────────────── */

export function initWidgets(scope) {
  scope.querySelectorAll('[data-widget]').forEach((root) => {
    switch (root.dataset.widget) {
      case 'jwt':
        initJwt(root);
        break;
      case 'rotate':
        initRotate(root);
        break;
      case 'cors':
        initCors(root);
        break;
      case 'chain':
        initChain(root);
        break;
      default:
        break;
    }
  });
}
