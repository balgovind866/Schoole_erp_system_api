

const express = require("express");
const router = express.Router();
const controller = require("../controllers/session_controller");
// const {
//   verifyToken,
//   isAdmin,
//   isActiveUser,
// } = require("../middleware/authentication");





// Protected routes
// router.use(verifyToken);
// router.use(isActiveUser);



// Session Management
router.post("/:schoolCode/sessions", controller.createSession);
router.get("/:schoolCode/sessions", controller.getSessionsBySchool);







module.exports = router;
