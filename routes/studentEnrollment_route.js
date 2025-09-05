

const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentEnrollment_controller");
const {
  verifyToken,
  isAdmin,
  isActiveUser,
} = require("../middleware/authentication");




// Protected routes
router.use(verifyToken);
router.use(isActiveUser);




// Student Enrollment
router.post("/:schoolCode/enrollments", controller.enrollStudent);
router.get("/sections/:sectionId/students", controller.getStudentsBySection);

module.exports = router;


