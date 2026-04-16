import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // ✅ Extract token
    const token = authHeader.split(" ")[1];

    // ❌ Invalid token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user info to request
    req.user = decoded; // { id, email, ... }

    next();
  } catch (err) {
    console.log("Auth Error:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
