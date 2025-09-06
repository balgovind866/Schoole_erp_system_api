const express = require("express");
const router = express.Router();
const authController = require("../controllers/authuser_controller");
const {
  verifyToken,
  isAdmin,
  isActiveUser,
} = require("../middleware/authentication");

// ========== PUBLIC ROUTES (No authentication required) ==========
// Login routes
router.post("/login", authController.loginTeacherOrStudent);
router.post("/login/admin", authController.loginAdmin);

// Logout route
router.post("/logout", authController.handleLogout);

// Setup routes (first time setup - no auth needed)
router.post("/admin/setup", authController.createSuperAdmin);

// First admin creation (no auth needed when no admin exists)
router.post("/register/admin", authController.createAdminAccount);

// ========== PROTECTED ROUTES (Authentication required) ==========
// Helper middleware array
const adminAuth = [verifyToken, isActiveUser, isAdmin];

// Admin-only routes
router.post("/register/teacher", adminAuth, authController.registerTeacher);
router.post("/register/student", adminAuth, authController.registerStudent);
//parents CRUD routes
router.get(
  "/student/:studentId/parents",
  adminAuth,
  authController.getParentsByStudentId
);
router.post(
  "/register/student/:studentId/parent",
  adminAuth,
  authController.addParent
);
router.put(
  "/student/:studentId/parent/:parentId",
  adminAuth,
  authController.updateParent
);

router.get("/users", adminAuth, authController.getAllUsers);
router.patch(
  "/users/:userId/toggle-status",
  adminAuth,
  authController.toggleUserStatus
);

// Protected admin creation route (for existing admins creating new admins)
router.post("/admin/create", adminAuth, authController.createAdminAccount);

module.exports = router;
