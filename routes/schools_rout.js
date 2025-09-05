// const express = require("express");
// const router = express.Router();
// const controller = require("../controllers/schools_contr");

// router.get('/info/:code', controller.getSchoolByCode);
// const { verifyToken, isAdmin, isActiveUser } = require('../middleware/authentication');
// router.use(verifyToken);
// router.use(isActiveUser);
//   router.post('/create', isAdmin, controller.createSchool);
//   router.post('/:schoolCode/sessions', controller.createSession);

// module.exports = router;
const express = require("express");
const router = express.Router();
const controller = require("../controllers/schools_contr");
const {
  verifyToken,
  isAdmin,
  isActiveUser,
} = require("../middleware/authentication");

// Public routes
router.get("/info/:code", controller.getSchoolByCode);
router.get("/:schoolCode/structure", controller.getCompleteSchoolStructure);

// Protected routes
router.use(verifyToken);
router.use(isActiveUser);

// School Management
router.post("/create", isAdmin, controller.createSchool);
router.put("/:schoolCode", isAdmin, controller.updateSchoolByCode); //update school info.
router.delete("/:schoolCode", isAdmin, controller.deleteSchoolByCode); //delete a school.




module.exports = router;
