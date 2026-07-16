const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "aike-dev-secret-change-me";
const TOKEN_EXPIRY = "12h";

function signToken(user) {
  return jwt.sign(
    { user_id: user.user_id, username: user.username, role: user.role, guest_id: user.guest_id || null },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// Attaches req.user if a valid Bearer token is present; never rejects
function attachUser(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      req.user = null;
    }
  }
  next();
}

// Rejects unless the logged-in user has one of the given roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Login required" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Not authorized" });
    next();
  };
}

module.exports = { signToken, attachUser, requireRole };
