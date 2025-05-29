
const { get } = require("../routes/authUser");
const db = require("../models");
const School = db.SchoolAll; // Use the actual model name from your sequelize.define
const Session = db.Session;

const createSchool = async (req, res) => {
  console.log("getSchoolInfoByCode called with code:");
  try {
    const schoolData = req.body;
    const school = await School.create(req.body);
    
    return res.status(201).json({
      success: true,
      data: school
    });
  } catch (error) {
    console.error('Error creating school:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create school',
      error: error.message
    });
  }
};


const getSchoolByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const school = await School.findOne({
      where: { code },
      include: [
        {
          model: Session,
          as: 'sessions'
        }
      ]
    });
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: school,
   
      
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch school',
      error: error.message
    });
  }
};


const createSession = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const sessionData = req.body;
    
    // Verify school exists
    const school = await School.findOne({
      where: { code: schoolCode }
    });
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
        
      });
    }
    
    // Add schoolCode to session data
    sessionData.schoolCode = schoolCode;
    
    const session = await Session.create(sessionData);
    
    return res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message
    });
  }
};


  module.exports = {
    createSchool,
    getSchoolByCode,
    createSession,
  }