


const express = require("express");
const router = express.Router();
const controller = require("../controllers/class_controller");
const {
  verifyToken,
  isAdmin,
  isActiveUser,
} = require("../middleware/authentication");

// Public routes
// router.get("/info/:code", controller.getSchoolByCode);
// router.get("/:schoolCode/structure", controller.getCompleteSchoolStructure);

// Protected routes
router.use(verifyToken);
router.use(isActiveUser);





// Class Management
router.post("/:schoolCode/classes", controller.createClass);
router.get("/:schoolCode/classes", controller.getClassesBySchool);
// router.get('/:schoolCode/sessions/:sessionId/classes', controller.getClassesBySchoolAndSession);


module.exports = router;
