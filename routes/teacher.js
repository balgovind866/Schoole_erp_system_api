const express = require("express");
const router = express.Router();
const controller = require("../controllers/teacher");
const { verifyToken, isAdmin, isActiveUser } = require('../middleware/authentication');
router.use(verifyToken);
router.use(isActiveUser);
router.post('/assign-teacher-subject', controller.assignTeacherToSectionSubject);
router.put('/assignments/:assignmentId', controller.updateTeacherAssignment);
router.delete('/assignments/:assignmentId',controller.removeTeacherAssignment);

module.exports = router;