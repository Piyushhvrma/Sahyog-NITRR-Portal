const jwt = require("jsonwebtoken");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 3 * 60 * 60 * 1000,
};

const createToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user.id,
        email: user.email,
        role: user.role || "student",
      },
    },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );
};

const sendAuthCookie = (res, token) => {
  res.cookie("token", token, cookieOptions);
};

const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role || "student",
  profilePictureUrl: user.profilePictureUrl || "",
});

module.exports = {
  createToken,
  sendAuthCookie,
  clearAuthCookie,
  sanitizeUser,
};