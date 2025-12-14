module.exports = function authorize(allowedProfiles = []) {
  return function (req, res, next) {
    const uuAppErrorMap = {};

    if (!req.user) {
      uuAppErrorMap["system/unauthenticated"] = {
        message: "User is not authenticated.",
        severity: "error"
      };
      return res.status(401).json({ uuAppErrorMap });
    }

    if (!allowedProfiles.includes(req.user.profile)) {
      uuAppErrorMap["system/unauthorized"] = {
        message: `User profile '${req.user.profile}' is not allowed to call this command.`,
        severity: "error"
      };
      return res.status(403).json({ uuAppErrorMap });
    }

    next();
  };
};
