const express = require("express");
const router = express.Router();
const controller = require("../controllers/schools_contr");


router.get('/info/:code', controller.getSchoolByCode);
const { verifyToken, isAdmin, isActiveUser } = require('../middleware/authentication');
router.use(verifyToken);
router.use(isActiveUser);
  router.post('/create', isAdmin, controller.createSchool);
  router.post('/:schoolCode/sessions', controller.createSession);
  
module.exports = router;