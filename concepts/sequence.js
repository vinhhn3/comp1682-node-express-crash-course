/* A small sequence-diagram renderer and the scenarios used by sequence.html
   and auth.html. No dependencies: absolute positions over a grid of actors. */

export const SEQUENCES = {
  raw: {
    title: 'A request reaches one function',
    caption: 'No framework. The server looks at the method and the path, then writes the whole response.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Node server', sub: 'the server file' },
      { name: 'Data', sub: 'the array in memory' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Ask for the product list', data: 'GET /products' },
      { from: 1, to: 2, label: 'Read the products', data: 'the array in the file' },
      { from: 2, to: 1, label: 'Six products', kind: 'return' },
      { from: 1, to: 0, label: '200 + JSON', kind: 'return', data: 'you set the status and the type' },
    ],
    table: [
      ['1', 'the request', 'a method and a path'],
      ['2', 'your function', 'the only router there is'],
      ['3', 'the data', 'an array in memory'],
      ['4', 'the response', 'status, content type and body, all written by hand'],
    ],
    note: 'Nothing is automatic yet. Forget one header, or one call to end the response, and the client waits.',
  },

  body: {
    title: 'A body becomes an object',
    caption: 'The body arrives in pieces. A parser collects it before your handler sees it.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Body parser', sub: 'reads the body' },
      { name: 'Handler', sub: 'your handler' },
      { name: 'Data', sub: 'the array in memory' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Send a new product', data: 'POST /products + a JSON body' },
      { from: 1, to: 2, label: 'Here is the body as an object', data: 'title, category, price' },
      { from: 2, to: 3, label: 'Add it to the list', data: 'a new product with an id' },
      { from: 3, to: 2, label: 'The saved product', kind: 'return' },
      { from: 2, to: 0, label: '201 + the product', kind: 'return' },
    ],
    table: [
      ['1', 'the raw body', 'bytes, not an object'],
      ['2', 'after the parser', 'req.body exists'],
      ['3', 'your checks', 'hand-written, one field at a time'],
      ['5', 'the response', '201 and the product you just made'],
    ],
    note: 'A parser is middleware: it runs before the handler, and the handler never sees the raw stream.',
  },

  route: {
    title: 'A URL picks the handler',
    caption: 'The router compares the method and the path, then calls one function.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Router', sub: 'the route table' },
      { name: 'Handler', sub: 'answers this URL' },
      { name: 'Data', sub: 'the array in memory' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Ask for one product', data: 'GET /products/2' },
      { from: 1, to: 2, label: 'This URL means "one product"', data: 'id = 2' },
      { from: 2, to: 3, label: 'Find that product', data: 'id = 2' },
      { from: 3, to: 2, label: 'The product', kind: 'return' },
      { from: 2, to: 0, label: '200 + the product', kind: 'return' },
    ],
    table: [
      ['1', 'the URL', 'a path with one changing part'],
      ['2', 'the router', 'method + path → one function'],
      ['3', 'the handler', 'reads the id and looks it up'],
      ['5', 'the response', 'the product, or a 404'],
    ],
    note: 'The router does not know how products are stored. It only knows which function answers which URL.',
  },

  controller: {
    title: 'The controller owns the answer',
    caption: 'The router names the work. The controller does it and chooses the status.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Router', sub: 'the route table' },
      { name: 'Controller', sub: 'handles the request' },
      { name: 'Data', sub: 'the array in memory' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Ask for the list', data: 'GET /products' },
      { from: 1, to: 2, label: 'The list belongs to this function', data: 'getAll' },
      { from: 2, to: 3, label: 'Read every product' },
      { from: 3, to: 2, label: 'The products', kind: 'return' },
      { from: 2, to: 0, label: '200 + JSON', kind: 'return' },
    ],
    table: [
      ['1', 'the router', 'only a table of URLs'],
      ['2', 'the controller', 'the HTTP conversation: read, choose, send'],
      ['3', 'the data', 'still in the controller for now'],
      ['5', 'the status', 'the controller decides 200 or 404'],
    ],
    note: 'The route file became a table of contents. The controller is cleaner about HTTP, but it still owns the data.',
  },

  repository: {
    title: 'The data moves behind a door',
    caption: 'The controller asks for products. The repository is the only one who knows where they live.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Controller', sub: 'handles the request' },
      { name: 'Repository', sub: 'data access' },
      { name: 'Storage', sub: 'an array, for now' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Ask for the list', data: 'GET /products' },
      { from: 1, to: 2, label: 'Give me every product', data: 'no database words here' },
      { from: 2, to: 3, label: 'Read the stored products' },
      { from: 3, to: 2, label: 'The products', kind: 'return' },
      { from: 2, to: 1, label: 'The products', kind: 'return' },
      { from: 1, to: 0, label: '200 + JSON', kind: 'return' },
    ],
    table: [
      ['1', 'the controller', 'asks for products, not rows or files'],
      ['2', 'the repository', 'the only data access'],
      ['3', 'the storage', 'an array today, a database at step 8'],
      ['6', 'the response', 'the controller only formats it'],
    ],
    note: 'The boundary is the point: swap the array for MongoDB in step 8 and the controller does not change.',
  },

  boot: {
    title: 'Connect before you listen',
    caption: 'The database is a dependency. Open it at boot, and stop if it is not there.',
    actors: [
      { name: 'server.js', sub: 'starts the app' },
      { name: 'Database helper', sub: 'opens the connection' },
      { name: 'MongoDB', sub: 'the database' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Start the app' },
      { from: 1, to: 2, label: 'Connect to the database', data: 'the shop database' },
      { from: 2, to: 1, label: 'Connected', kind: 'return' },
      { from: 1, to: 0, label: 'Ready; now listen on port 8000', kind: 'return' },
    ],
    table: [
      ['1', 'the entry point', 'one place that starts everything'],
      ['2', 'the connection', 'opened once, reused by every request'],
      ['3', 'if it fails', 'log the reason, then exit'],
      ['5', 'the port', 'opened only after the database is ready'],
    ],
    note: 'A server that answers with a broken database is worse than a server that clearly did not start.',
  },

  read: {
    title: 'Read: search, then send JSON',
    caption: 'Follow the search down and the products back up. Every hop changes the shape a little.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Router', sub: 'the route table' },
      { name: 'Controller', sub: 'handles the request' },
      { name: 'Repository', sub: 'data access' },
      { name: 'MongoDB', sub: 'the database' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Ask for products matching "mug"', data: 'search = "mug"' },
      { from: 1, to: 2, label: 'This is a list request', data: 'search = "mug"' },
      { from: 2, to: 3, label: 'Find the matching products', data: 'search = "mug"' },
      { from: 3, to: 4, label: 'Look in the title and description', data: 'a database query' },
      { from: 4, to: 3, label: 'The matching products', kind: 'return', data: 'database documents' },
      { from: 3, to: 2, label: 'The products', kind: 'return', data: 'plain objects' },
      { from: 2, to: 0, label: '200 + JSON', kind: 'return', data: 'each document keeps an id' },
    ],
    table: [
      ['1', 'the search', 'a word from the URL'],
      ['3', 'the repository', 'turns the word into a database query'],
      ['5', 'the documents', 'what the database actually returns'],
      ['7', 'the response', 'the same shape the client already knew'],
    ],
    note: 'The cache sits in front of this picture. On a HIT the request stops after step 2 and the controller never runs.',
  },

  error: {
    title: 'One missing field, one clear answer',
    caption: 'The body check stops the request before the controller. Every failure takes the same exit.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Router', sub: 'the route' },
      { name: 'Auth check', sub: 'who are you?' },
      { name: 'Body check', sub: 'are the fields valid?' },
      { name: 'Controller', sub: 'never reached' },
      { name: 'Error handler', sub: 'one exit' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Send a product with no title', data: 'category and price only' },
      { from: 1, to: 2, label: 'Check the token first' },
      { from: 2, to: 3, label: 'The user is known; check the body' },
      { from: 3, to: 5, label: 'The title is missing', data: '400, and which field' },
      { from: 5, to: 0, label: '400 + JSON', kind: 'return', data: 'the same error shape as always' },
    ],
    table: [
      ['1', 'the request', 'a body that looks reasonable but is incomplete'],
      ['4', 'the body check', 'stops the request and names the field'],
      ['4', 'the controller', 'skipped entirely; no database call'],
      ['5', 'the error handler', 'turns any failure into one JSON shape'],
    ],
    note: 'A failure is not a special case bolted on at the end. It is a path through the same middleware, with one exit.',
  },

  update: {
    title: 'Change one field, keep the rest',
    caption: 'A partial update checks only the fields that arrived, then saves the document.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Body check', sub: 'fields that arrived' },
      { name: 'Controller', sub: 'finds and saves' },
      { name: 'Repository', sub: 'data access' },
      { name: 'MongoDB', sub: 'the database' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Change only the price', data: 'price = 19.5' },
      { from: 1, to: 2, label: 'These fields are allowed' },
      { from: 2, to: 3, label: 'Load the product first' },
      { from: 3, to: 4, label: 'Find it by id' },
      { from: 4, to: 3, label: 'The product', kind: 'return' },
      { from: 3, to: 2, label: 'The product', kind: 'return' },
      { from: 2, to: 3, label: 'Save the new price' },
      { from: 3, to: 4, label: 'Update the document' },
      { from: 4, to: 2, label: 'The updated product', kind: 'return' },
      { from: 2, to: 0, label: '200 + the product', kind: 'return' },
    ],
    table: [
      ['1', 'the body', 'one field, not a whole product'],
      ['3', 'the load', 'we need the document before we change it'],
      ['7', 'the save', 'the database validates the new value'],
      ['10', 'the response', '200, or 404 if it was already gone'],
    ],
    note: 'PATCH means "change these fields". A full PUT would replace the document. DELETE is shorter: 204 with no body.',
  },

  register: {
    title: 'Register: a password becomes a hash',
    caption: 'The plain password is used once. Only the hash is stored.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Controller', sub: 'handles the request' },
      { name: 'Repository', sub: 'data access' },
      { name: 'MongoDB', sub: 'the database' },
      { name: 'bcrypt', sub: 'hash function' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Register a new user', data: 'username + password' },
      { from: 1, to: 2, label: 'Is this name already taken?' },
      { from: 2, to: 3, label: 'Look up the name' },
      { from: 3, to: 2, label: 'No user with that name', kind: 'return' },
      { from: 1, to: 4, label: 'Turn the password into a hash', data: 'the only time the plain text is used' },
      { from: 4, to: 1, label: 'The hash', kind: 'return', data: 'one-way and salted' },
      { from: 1, to: 2, label: 'Save the new user' },
      { from: 2, to: 3, label: 'Insert the user with the hash' },
      { from: 3, to: 1, label: 'The saved user', kind: 'return' },
      { from: 1, to: 0, label: '201, without the password', kind: 'return', data: 'id, username, role' },
    ],
    table: [
      ['1', 'the request', 'the only place the plain password is on the wire'],
      ['2', 'the duplicate check', 'a quick lookup before hashing'],
      ['5', 'bcrypt', 'one-way: you can check it, never read it'],
      ['10', 'the response', 'no password and no hash, ever'],
    ],
    note: 'The database unique rule is the real guard. The early lookup is a friendly answer for the common case.',
  },

  login: {
    title: 'Login: check the hash, sign a token',
    caption: 'The password is compared once. After that the client carries a signed claim.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Controller', sub: 'handles the request' },
      { name: 'Repository', sub: 'data access' },
      { name: 'MongoDB', sub: 'the database' },
      { name: 'bcrypt', sub: 'compares' },
      { name: 'jwt', sub: 'signs tokens' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Log in', data: 'username + password' },
      { from: 1, to: 2, label: 'Find the user' },
      { from: 2, to: 3, label: 'Load the user and the password hash' },
      { from: 3, to: 2, label: 'The user + hash', kind: 'return' },
      { from: 2, to: 1, label: 'The user + hash', kind: 'return' },
      { from: 1, to: 4, label: 'Does the password match the hash?' },
      { from: 4, to: 1, label: 'Yes', kind: 'return' },
      { from: 1, to: 5, label: 'Sign an access token', data: 'the user id, name and role' },
      { from: 5, to: 1, label: 'The token', kind: 'return', data: 'readable claims + a signature' },
      { from: 1, to: 0, label: '200 + token + user', kind: 'return' },
    ],
    table: [
      ['1', 'the request', 'username and password'],
      ['2', 'the lookup', 'the password hash is hidden from normal reads'],
      ['6', 'bcrypt', 'compare, never decrypt'],
      ['8', 'the token', 'a claim the client can read but not forge'],
    ],
    note: 'A missing user and a wrong password get the same answer. Any difference would tell an attacker which names exist.',
  },

  create: {
    title: 'Write: two checks before the work',
    caption: 'Auth asks who you are. The body check asks whether the request makes sense. Only then does the controller run.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Router', sub: 'the route' },
      { name: 'Auth check', sub: 'checks the token' },
      { name: 'Body check', sub: 'are the fields valid?' },
      { name: 'Controller', sub: 'does the work' },
      { name: 'Repository', sub: 'saves' },
      { name: 'MongoDB', sub: 'the database' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Create a product', data: 'a token + the fields' },
      { from: 1, to: 2, label: 'Check the token' },
      { from: 2, to: 3, label: 'This is a known user; check the body' },
      { from: 3, to: 4, label: 'The body is clean; do the work' },
      { from: 4, to: 5, label: 'Save it for this user' },
      { from: 5, to: 6, label: 'Insert the product' },
      { from: 6, to: 5, label: 'The new product', kind: 'return' },
      { from: 5, to: 4, label: 'The new product', kind: 'return' },
      { from: 4, to: 0, label: '201 + JSON', kind: 'return' },
    ],
    table: [
      ['1', 'the request', 'a bearer token and a JSON body'],
      ['2', 'the token check', 'a valid user, or 401'],
      ['4', 'the body check', 'clean fields, or 400 with details'],
      ['5', 'the controller', 'adds the owner and saves'],
      ['9', 'the response', '201 with the product'],
    ],
    note: 'The order matters: an unknown caller gets 401 and learns nothing about the field rules.',
  },

  refresh: {
    title: 'Refresh: one token in, a new pair out',
    caption: 'The old refresh token is verified, matched against a stored fingerprint, and replaced.',
    actors: [
      { name: 'Browser', sub: 'holds two tokens' },
      { name: 'Controller', sub: 'handles the request' },
      { name: 'Repository', sub: 'data access' },
      { name: 'MongoDB', sub: 'the database' },
      { name: 'jwt', sub: 'checks and signs' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Use refresh token A', data: 'the long-lived token' },
      { from: 1, to: 4, label: 'Is A signed by us and still valid?' },
      { from: 4, to: 1, label: 'Yes; here are the claims', kind: 'return' },
      { from: 1, to: 2, label: 'Load the user' },
      { from: 2, to: 3, label: 'Read the saved fingerprint' },
      { from: 3, to: 2, label: 'The user + fingerprint', kind: 'return', data: 'the fingerprint of token B' },
      { from: 2, to: 1, label: 'The user + fingerprint', kind: 'return' },
      { from: 1, to: 4, label: 'Make a new pair' },
      { from: 4, to: 1, label: 'Access B + refresh B', kind: 'return' },
      { from: 1, to: 2, label: 'Save the fingerprint of B' },
      { from: 2, to: 3, label: 'Replace the old fingerprint' },
      { from: 1, to: 0, label: '200 + the new pair', kind: 'return' },
    ],
    table: [
      ['1', 'the request', 'only the refresh token; no password'],
      ['2', 'the signature check', 'it really came from this server'],
      ['5', 'the fingerprint', 'a hash stored on the user, so it can be revoked'],
      ['10', 'the rotation', 'the old fingerprint is replaced by the new one'],
    ],
    note: 'A refresh token is a credential. Storing only its fingerprint means a database leak gives an attacker nothing they can present.',
  },

  reuse: {
    title: 'Reuse: the old token comes back',
    caption: 'The signature is still valid, but the saved fingerprint has moved on.',
    actors: [
      { name: 'Browser', sub: 'still holds the old one' },
      { name: 'Controller', sub: 'handles the request' },
      { name: 'Repository', sub: 'data access' },
      { name: 'MongoDB', sub: 'the database' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Use the old refresh token A again' },
      { from: 1, to: 2, label: 'Load the user' },
      { from: 2, to: 3, label: 'Read the saved fingerprint' },
      { from: 3, to: 2, label: 'The fingerprint of B', kind: 'return' },
      { from: 2, to: 1, label: 'The fingerprint of B', kind: 'return' },
      { from: 1, to: 0, label: '401: A is no longer the saved token', kind: 'return' },
    ],
    table: [
      ['1', 'the request', 'A still has a valid signature'],
      ['4', 'the comparison', 'the stored fingerprint belongs to B'],
      ['6', 'the answer', '401; the client must log in again'],
    ],
    note: 'Rotation makes a stolen refresh token single-use. A real system would also revoke the whole token family here.',
  },

  limit: {
    title: 'The door checks the count first',
    caption: 'A limiter answers before the expensive work: no password check, no database, no handler.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Rate limiter', sub: 'counts requests' },
      { name: 'Auth check', sub: 'who are you?' },
      { name: 'Body check', sub: 'valid fields?' },
      { name: 'Controller', sub: 'does the work' },
    ],
    steps: [
      { from: 0, to: 1, label: 'A request arrives' },
      { from: 1, to: 2, label: 'Under the limit; continue' },
      { from: 2, to: 3, label: 'A known user; check the body' },
      { from: 3, to: 4, label: 'A clean body; do the work' },
      { from: 4, to: 0, label: '200 or 201', kind: 'return' },
    ],
    table: [
      ['1', 'the limiter', 'a counter per address and per minute'],
      ['2', 'under the limit', 'the request continues normally'],
      ['—', 'over the limit', '429 and a Retry-After; nothing below runs'],
      ['4', 'the handler', 'never knows the limiter exists'],
    ],
    note: 'A separate, stricter limiter guards login. That is the door an attacker would actually try.',
  },

  preflight: {
    title: 'A different origin asks twice',
    caption: 'The browser sends a permission question first, then the real request.',
    actors: [
      { name: 'Page :5173', sub: 'the page' },
      { name: 'Browser', sub: 'enforces the rule' },
      { name: 'API :8000', sub: 'another origin' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Fetch the API on another origin' },
      { from: 1, to: 2, label: 'May I send JSON and a token?', data: 'OPTIONS, not the real request' },
      { from: 2, to: 1, label: 'Yes, from localhost:5173', kind: 'return', data: 'the allow header' },
      { from: 1, to: 2, label: 'Now the real request', data: 'POST + a token' },
      { from: 2, to: 1, label: '201 + the allow header', kind: 'return' },
      { from: 1, to: 0, label: 'The page can read the body', kind: 'return' },
    ],
    table: [
      ['1', 'the page', 'a different scheme, host or port is a different origin'],
      ['2', 'the browser', 'asks permission before a JSON or token request'],
      ['3', 'the server', 'answers the preflight; it does not enforce the rule'],
      ['6', 'the page', 'sees the body only if the response allows it'],
    ],
    note: 'curl never asks. That is why a CORS failure appears only in a browser, and why the server log still shows a 200.',
  },

  cachedRead: {
    title: 'The second read never reaches the database',
    caption: 'The first request fills the cache. The second one is answered from memory.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Cache', sub: 'stored answers' },
      { name: 'Controller', sub: 'does the work' },
      { name: 'Repository', sub: 'data access' },
      { name: 'MongoDB', sub: 'the database' },
    ],
    steps: [
      { from: 0, to: 1, label: 'First read of the list' },
      { from: 1, to: 2, label: 'Nothing stored yet', data: 'a miss' },
      { from: 2, to: 3, label: 'Find the products' },
      { from: 3, to: 4, label: 'Query the database' },
      { from: 4, to: 2, label: 'The products', kind: 'return' },
      { from: 2, to: 1, label: 'Store this answer for 60 seconds' },
      { from: 1, to: 0, label: '200 + the products', kind: 'return' },
      { from: 0, to: 1, label: 'Second read of the same URL' },
      { from: 1, to: 0, label: '200 + the stored answer', kind: 'return', data: 'a hit; no database' },
    ],
    table: [
      ['1', 'the key', 'the full URL, including the query'],
      ['2', 'a miss', 'the normal path runs and the answer is stored'],
      ['8', 'a hit', 'the request stops at the cache'],
      ['—', 'the risk', 'a write does not clear it yet'],
    ],
    note: 'A cache is a copy of an old answer. It is fast, and it is wrong until somebody invalidates it.',
  },

  writeInvalidate: {
    title: 'A write clears the old answer',
    caption: 'The save succeeds, the cache is emptied, and the next read rebuilds it.',
    actors: [
      { name: 'Browser', sub: 'the client' },
      { name: 'Cache', sub: 'stored answers' },
      { name: 'Controller', sub: 'does the work' },
      { name: 'Repository', sub: 'data access' },
      { name: 'MongoDB', sub: 'the database' },
    ],
    steps: [
      { from: 0, to: 2, label: 'Create a product', data: 'a write passes the checks first' },
      { from: 2, to: 3, label: 'Save it' },
      { from: 3, to: 4, label: 'Insert the document' },
      { from: 4, to: 2, label: 'The saved product', kind: 'return' },
      { from: 2, to: 1, label: 'Clear every stored list' },
      { from: 2, to: 0, label: '201 + the product', kind: 'return' },
      { from: 0, to: 1, label: 'Read the list again' },
      { from: 1, to: 2, label: 'Nothing stored now', data: 'a miss' },
      { from: 2, to: 3, label: 'Find the products' },
      { from: 3, to: 4, label: 'Query the database' },
      { from: 4, to: 2, label: 'The fresh list', kind: 'return' },
      { from: 1, to: 0, label: '200 + the fresh list', kind: 'return' },
    ],
    table: [
      ['1', 'the write', 'the data changes first'],
      ['5', 'the clear', 'every cached list is now gone'],
      ['8', 'the next read', 'a miss, so the list is rebuilt'],
      ['12', 'the response', 'the new product is in it'],
    ],
    note: 'Clear everything first, then make it precise. A wrong cache key is a data leak; a missing clear is a stale page.',
  },

  bootConfig: {
    title: 'Config is read once, then handed down',
    caption: 'One file reads the environment. Every other module asks it for the values it needs.',
    actors: [
      { name: 'Startup', sub: 'the process' },
      { name: 'Config', sub: 'one reader' },
      { name: 'App modules', sub: 'the rest of the app' },
      { name: 'MongoDB', sub: 'the database' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Start the app and read the environment', data: 'port, URI, secrets, origins' },
      { from: 1, to: 2, label: 'Here are the values' },
      { from: 2, to: 3, label: 'Connect with the database URI' },
      { from: 3, to: 2, label: 'Connected', kind: 'return' },
      { from: 2, to: 0, label: 'Listen on the configured port', kind: 'return' },
    ],
    table: [
      ['1', 'the environment', 'the .env file or the real environment'],
      ['2', 'the check', 'a bad port or a default secret stops the boot'],
      ['3', 'the values', 'plain settings, no hidden reads'],
      ['6', 'the app', 'one port, one database, one set of secrets'],
    ],
    note: 'After this step, grep for process.env inside src returns one file. The next person copies one .env.example.',
  },

  docs: {
    title: 'The documentation is built from the routes',
    caption: 'A comment beside the route becomes a document a tool can read and a page a person can click.',
    actors: [
      { name: 'Route file', sub: 'the comment and the route' },
      { name: 'Doc generator', sub: 'reads the comments' },
      { name: 'OpenAPI document', sub: 'the generated spec' },
      { name: 'Browser', sub: 'the reader' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Read the comments above the routes' },
      { from: 1, to: 2, label: 'Build one OpenAPI document' },
      { from: 3, to: 2, label: 'Ask for the document', data: 'GET /api-docs.json' },
      { from: 2, to: 3, label: 'The routes, parameters and schemas', kind: 'return' },
      { from: 3, to: 2, label: 'Open the clickable page', data: 'GET /api-docs' },
      { from: 2, to: 3, label: 'Swagger UI', kind: 'return' },
    ],
    table: [
      ['1', 'the comment', 'lives next to the route it describes'],
      ['2', 'the document', 'one OpenAPI file, generated at boot'],
      ['4', 'the JSON', 'usable by other tools, not only humans'],
      ['6', 'the UI', 'a development page; it can be gated later'],
    ],
    note: 'The comment can still drift from the code. Keeping it in the same file makes the drift visible in review.',
  },

  test: {
    title: 'A test calls the app without a port',
    caption: 'The app is a function of a request. The database is real, but disposable.',
    actors: [
      { name: 'Test', sub: 'the test runner' },
      { name: 'App', sub: 'the express app' },
      { name: 'Controller', sub: 'routes and checks' },
      { name: 'Repository', sub: 'data access' },
      { name: 'Memory MongoDB', sub: 'a disposable database' },
    ],
    steps: [
      { from: 0, to: 1, label: 'Create a product with a token', data: 'no network, no port' },
      { from: 1, to: 2, label: 'Run the same middleware and controller' },
      { from: 2, to: 3, label: 'Save the product' },
      { from: 3, to: 4, label: 'Insert the document' },
      { from: 4, to: 3, label: 'The saved product', kind: 'return' },
      { from: 3, to: 2, label: 'The saved product', kind: 'return' },
      { from: 2, to: 0, label: '201 + the product', kind: 'return', data: 'the assertion reads it' },
    ],
    table: [
      ['1', 'the test', 'builds a request in memory'],
      ['2', 'the app', 'the same object production uses'],
      ['4', 'the database', 'real MongoDB behaviour, thrown away after the run'],
      ['7', 'the assertion', 'one promise the API makes, checked'],
    ],
    note: 'No listen, no orphan process, no shared database. That is why the app and the server are separate files.',
  },
};

/* ── renderer ─────────────────────────────────────────────────────── */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');

export function renderSequence(container, seq) {
  const n = seq.actors.length;
  const pct = (i) => `calc((${i} + 0.5) * 100% / ${n})`;
  const px = (i) => `calc((${i} + 0.5) * 100% / ${n})`;
  const midpoint = (from, to) => `calc((${from + to + 1} / 2) * 100% / ${n})`;

  container.dataset.actors = JSON.stringify(seq.actors.map((a) => a.name));

  const actors = seq.actors
    .map(
      (actor) =>
        `<div class="seq-actor"><b>${esc(actor.name)}</b>${actor.sub ? `<small>${esc(actor.sub)}</small>` : ''}</div>`,
    )
    .join('');

  const lives = seq.actors
    .map((_, i) => `<i class="seq-life" style="left:${pct(i)}"></i>`)
    .join('');

  const rows = seq.steps
    .map((step, index) => {
      const kind = step.kind === 'return' ? 'return' : 'call';
      const rev = step.to < step.from;
      const width = `calc(${Math.abs(step.to - step.from)} * 100% / ${n})`;
      const left = step.to >= step.from ? pct(step.from) : pct(step.to);
      const data = step.data || step.label;

      return `<div class="seq-row ${kind} ${rev ? 'rev' : ''}" data-i="${index}"
          data-from="${step.from}" data-to="${step.to}"
          data-label="${attr(step.label)}" data-data="${attr(data)}">
        <span class="seq-n" style="left:${pct(step.from)}">${index + 1}</span>
        <span class="seq-line" style="left:${left};width:${width}"></span>
        <span class="seq-label" style="left:${midpoint(step.from, step.to)}">
          <b>${esc(step.label)}</b>
          ${step.data ? `<small>${esc(step.data)}</small>` : ''}
        </span>
        <span class="seq-packet" style="left:${px(step.from)}" title="${attr(data)}">${esc(data)}</span>
      </div>`;
    })
    .join('');

  container.innerHTML = `
    <div class="seq-wrap">
      <div class="seq" style="--n:${n}" data-n="${n}">
        <div class="seq-actors">${actors}</div>
        <div class="seq-body">
          ${lives}
          ${rows}
        </div>
      </div>
    </div>
    <div class="seq-status">
      <span class="n">play</span>
      <span class="seq-status-text">Press <b>Play</b>: each arrow carries the value written on it. Follow the chip, not the line.</span>
    </div>
    <ul class="seq-log" aria-live="polite"></ul>
    <p class="dg-note" style="margin-top:8px">${esc(seq.caption)}</p>
  `;
}

const states = new WeakMap();

export function stopSequence(container) {
  const state = states.get(container);
  if (state) state.cancelled = true;
  states.delete(container);

  container.querySelectorAll('.seq-row').forEach((row) => row.classList.remove('now', 'dim'));
  container.querySelectorAll('.seq-packet').forEach((packet) => {
    packet.getAnimations().forEach((animation) => animation.cancel());
    packet.style.opacity = '';
  });
}

function actorName(container, i) {
  try {
    return JSON.parse(container.dataset.actors || '[]')[i] || `actor ${i}`;
  } catch {
    return `actor ${i}`;
  }
}

function setStatus(container, n, total, row) {
  const chip = container.querySelector('.seq-status .n');
  const text = container.querySelector('.seq-status-text');
  if (!chip || !text) return;

  if (!row) {
    chip.textContent = 'done';
    text.innerHTML = `<b>${total}</b> arrows. The request is finished; the last value is the response.`;
    return;
  }

  const from = actorName(container, Number(row.dataset.from));
  const to = actorName(container, Number(row.dataset.to));
  chip.textContent = `${n} / ${total}`;
  text.innerHTML = `<b>${esc(from)} → ${esc(to)}</b> · ${esc(row.dataset.label)} · <code>${esc(row.dataset.data)}</code>`;
}

function addLog(container, number, row) {
  const log = container.querySelector('.seq-log');
  if (!log) return;
  const from = actorName(container, Number(row.dataset.from));
  const to = actorName(container, Number(row.dataset.to));
  const li = document.createElement('li');
  li.innerHTML = `<span class="n">${number}</span><b>${esc(from)} → ${esc(to)}</b><code>${esc(row.dataset.data)}</code>`;
  log.append(li);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function playSequence(container) {
  stopSequence(container);

  container.scrollIntoView({ block: 'nearest' });

  const rows = [...container.querySelectorAll('.seq-row')];
  if (!rows.length) return;

  const n = Number(container.querySelector('.seq')?.dataset.n || 5);
  const log = container.querySelector('.seq-log');
  if (log) log.innerHTML = '';

  const state = { cancelled: false };
  states.set(container, state);

  const animate = (row) => {
    const packet = row.querySelector('.seq-packet');
    if (!packet) return null;

    const width = row.getBoundingClientRect().width;
    const from = Number(row.dataset.from);
    const to = Number(row.dataset.to);
    const start = ((from + 0.5) / n) * width;
    const end = ((to + 0.5) / n) * width;

    packet.style.left = `${start}px`;
    packet.style.opacity = '1';

    return packet.animate(
      [
        { transform: 'translate(-50%, -50%) translateX(0px)' },
        { transform: `translate(-50%, -50%) translateX(${end - start}px)` },
      ],
      { duration: 1400, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' },
    );
  };

  for (let i = 0; i < rows.length; i += 1) {
    if (state.cancelled) return;

    rows.forEach((row, index) => {
      row.classList.toggle('now', index === i);
      row.classList.toggle('dim', index < i);
    });

    const row = rows[i];
    const wrap = container.querySelector('.seq-wrap');
    if (wrap) {
      const wr = wrap.getBoundingClientRect();
      const rr = row.getBoundingClientRect();
      if (rr.top < wr.top + 62) wrap.scrollTop += rr.top - wr.top - 62;
      else if (rr.bottom > wr.bottom - 12) wrap.scrollTop += rr.bottom - wr.bottom + 12;
    }
    setStatus(container, i + 1, rows.length, row);
    addLog(container, i + 1, row);

    /* Let the room read the value before it moves. */
    await sleep(550);
    if (state.cancelled) return;

    const animation = animate(row);
    if (animation) {
      /* The timing must not depend on the tab being visible: a backgrounded
         browser throttles animations, and the lesson would freeze. */
      await Promise.race([animation.finished.catch(() => {}), sleep(1500)]);
    } else {
      await sleep(1500);
    }
    if (state.cancelled) return;

    /* Hold at the destination so the arrow and its payload can be named. */
    await sleep(950);
    if (state.cancelled) return;
  }

  rows.forEach((row) => row.classList.remove('now'));
  setStatus(container, rows.length, rows.length, null);
  states.delete(container);
}

export function togglePlay(container, button) {
  const state = states.get(container);

  if (state && !state.cancelled) {
    stopSequence(container);
    button.textContent = 'Play';
    return;
  }

  button.textContent = 'Stop';
  playSequence(container).finally(() => {
    button.textContent = 'Play';
  });
}
