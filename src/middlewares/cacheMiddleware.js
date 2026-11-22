const cache = require('memory-cache');

function cacheMiddleware(seconds) {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl}`;
    const hit = cache.get(key);

    if (hit) {
      res.set('X-Cache', 'HIT');
      return res.json(hit);
    }

    const originalJson = res.json.bind(res);

    res.set('X-Cache', 'MISS');
    res.json = (body) => {
      cache.put(key, body, seconds * 1000);
      return originalJson(body);
    };

    next();
  };
}

function clearCache(req, res, next) {
  cache.clear();
  next();
}

module.exports = cacheMiddleware;
module.exports.clearCache = clearCache;
