
const express = require("express");
const router = express.Router();
const controller = require("../controllers/section_controller");
const {
  verifyToken,
  isAdmin,
  isActiveUser,
} = require("../middleware/authentication");






// Protected routes
router.use(verifyToken);
router.use(isActiveUser);




// Section Management
router.post("/:schoolCode/classes/:classId/sections", controller.createSection);
router.get("/classes/:classId/sections", controller.getSectionsByClass);



module.exports = router;

