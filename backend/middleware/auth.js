const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    return res.status(401).json({
      message: "Token is not valid",
    });
  }
};

const adminAuth = (req, res, next) => {
  const password = req.header("x-admin-password");

  if (!password) {
    return res.status(401).json({
      message: "Access Denied: No admin password provided.",
    });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    return next();
  }

  return res.status(403).json({
    message: "Access Denied: Invalid admin password.",
  });
};

module.exports = {
  jwtAuth,
  adminAuth,
};