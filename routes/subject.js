const express = require("express");
const router = express.Router();
const controller = require("../controllers/subjects");
const { verifyToken, isAdmin, isActiveUser } = require('../middleware/authentication');
router.use(verifyToken);
router.use(isActiveUser);
router.post('/:schoolCode/subjects', controller.createSubject);
router.get('/:schoolCode/subjects',  controller.getSubjectsBySchool);
router.put('/subjects/:subjectId', controller.updateSubject);
router.delete('/subjects/:subjectId',controller.deleteSubject);


router.post('/classes/assign-subjects', controller.assignSubjectToClass);
router.delete('/classes/:classId/subjects/:subjectId', controller.removeSubjectFromClass);
router.get('/classes/:classId/subjects', controller.getClassSubjects);
module.exports = router;