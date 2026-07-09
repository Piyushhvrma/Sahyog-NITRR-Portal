const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: login required.",
      });
    }

    const userRole = req.user.role || "student";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = requireRole;