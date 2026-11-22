/* Express 4 does not catch a rejected promise for you. This turns one into next(err). */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
