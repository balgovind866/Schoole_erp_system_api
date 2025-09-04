const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const db = require("../models");

/**
 * Middleware to verify access token
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };
    console.log("verifyToken");
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * Allow only admin users
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/**
 * Allow only teacher users
 */
const isTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== "teacher") {
    return res.status(403).json({ message: "Teacher access required" });
  }
  next();
};

/**
 * Allow only admin or teacher users
 */
const isAdminOrTeacher = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "teacher")) {
    return res
      .status(403)
      .json({ message: "Admin or teacher access required" });
  }
  next();
};

/**
 * Check if user is active
 */
const isActiveUser = async (req, res, next) => {
  try {
    const user = await db.AuthUser.findByPk(req.user.id);

    if (!user || !user.isActive) {
      return res
        .status(403)
        .json({
          message: "Account is deactivated. Please contact an administrator.",
        });
    }

    next();
  } catch (err) {
    console.error("Error checking user status:", err);
    return res
      .status(500)
      .json({ message: "Server error during authorization" });
  }
};

/**
 * Role-based access control middleware
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (Array.isArray(roles)) {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (req.user.role !== roles) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

/**
 * Allow resource owner or admin
 */
const isOwnerOrAdmin = (resourceModel) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      if (req.user.role === "admin") return next();

      const resourceId = req.params.id;
      if (!resourceId)
        return res.status(400).json({ message: "Resource ID required" });

      const resource = await resourceModel.findByPk(resourceId);
      if (!resource)
        return res.status(404).json({ message: "Resource not found" });

      if (resource.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (err) {
      console.error("Authorization error:", err);
      res.status(500).json({ message: "Server error during authorization" });
    }
  };
};

module.exports = {
  verifyToken,
  isAdmin,
  isTeacher,
  isAdminOrTeacher,
  isActiveUser,
  hasRole,
  isOwnerOrAdmin,
};
