const config = require('./src/config');
const app = require('./src/app');
const connectToDatabase = require('./src/config/database');

async function start() {
  await connectToDatabase();

  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}

start();
