module.exports = function auth(req, res, next) {
  const profile = req.header("X-User-Profile");

  const uuIdentity = req.header("X-User-Identity") || req.header("X-User-Id");

  if (!profile || !uuIdentity) {
    req.user = null;
  } else {
    req.user = { uuIdentity, profile };
  }

  next();
};
