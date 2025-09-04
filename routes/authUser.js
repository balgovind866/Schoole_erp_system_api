const express = require("express");
const router = express.Router();
const authController = require("../controllers/authuser_controller");
const controller = require("../controllers/schools_contr");
const {
  verifyToken,
  isAdmin,
  isActiveUser,
} = require("../middleware/authentication");

// Public routes
router.post("/login", authController.loginTeacherOrStudent);
router.post("/login/admin", authController.loginAdmin);
router.post("/logout", authController.handleLogout);

// First admin creation (only works when no admin exists)
router.post("/admin/setup", authController.createAdminAccount);

// Protected admin routes - require authentication
router.use(verifyToken);
router.use(isActiveUser);

// Admin-only routes
router.post("/register/admin", isAdmin, authController.createAdminAccount);
router.post("/register/teacher", isAdmin, authController.registerTeacher);
router.post("/register/student", isAdmin, authController.registerStudent);

// FIXED: Remove the console.log from the route handler
router.get("/users", isAdmin, authController.getAllUsers);
router.patch(
  "/users/:userId/toggle-status",
  isAdmin,
  authController.toggleUserStatus
);

module.exports = router;
