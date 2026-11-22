const http = require('node:http');

const products = [
  { id: 1, title: 'Aero Mug', category: 'Kitchen', price: 24, description: 'A thin-walled mug that keeps coffee warm for an hour.', stock: 40 },
  { id: 2, title: 'Halo Headphones', category: 'Audio', price: 89, description: 'Closed-back headphones with a detachable cable.', stock: 12 },
  { id: 3, title: 'Fern Pot', category: 'Home', price: 32, description: 'Glazed stoneware pot with a drainage tray.', stock: 25 },
  { id: 4, title: 'Slate Keyboard', category: 'Desk', price: 129, description: 'Tenkeyless mechanical keyboard, quiet switches.', stock: 8 },
  { id: 5, title: 'Ember Candle', category: 'Home', price: 18, description: 'Soy candle, cedar and smoke, 40 hour burn.', stock: 60 },
  { id: 6, title: 'Field Backpack', category: 'Travel', price: 74, description: 'Waxed canvas, 22 litres, laptop sleeve.', stock: 15 },
];

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/products') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(products));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 8000;

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
