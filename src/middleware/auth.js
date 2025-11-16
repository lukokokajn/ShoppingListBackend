module.exports = function auth(req, res, next) {
  const profile = req.header("X-User-Profile");
  const userId = req.header("X-User-Id") || "demo-user-id";
  if (!profile) req.user = null;
  else req.user = { uuIdentity: userId, profile };
  next();
};
