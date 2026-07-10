const jwt = require("jsonwebtoken");

const optionalJwtAuth = (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.header("x-auth-token");

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded.user;
  } catch {
    req.user = null;
  }

  return next();
};

module.exports = optionalJwtAuth;