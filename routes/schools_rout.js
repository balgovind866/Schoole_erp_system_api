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
const { verifyToken, isAdmin, isActiveUser } = require('../middleware/authentication');

// Public routes
router.get('/info/:code', controller.getSchoolByCode);
router.get('/:schoolCode/structure', controller.getCompleteSchoolStructure);

// Protected routes
router.use(verifyToken);
router.use(isActiveUser);

// School Management
router.post('/create', isAdmin, controller.createSchool);

// Session Management
router.post('/:schoolCode/sessions', controller.createSession);
router.get('/:schoolCode/sessions', controller.getSessionsBySchool);

// Class Management
router.post('/:schoolCode/classes', controller.createClass);
router.get('/:schoolCode/classes', controller.getClassesBySchool);

// Section Management
router.post('/:schoolCode/classes/:classId/sections', controller.createSection);
router.get('/classes/:classId/sections', controller.getSectionsByClass);

// Student Enrollment
router.post('/:schoolCode/enrollments', controller.enrollStudent);
router.get('/sections/:sectionId/students', controller.getStudentsBySection);




module.exports = router;
