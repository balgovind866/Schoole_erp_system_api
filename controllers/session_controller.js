// controllers/school_controller.js
const db = require("../models");
const School = db.SchoolAll;
const Session = db.Session;







// Session Controllers
const createSession = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const sessionData = req.body;

    // Verify school exists
    const school = await School.findOne({
      where: { code: schoolCode },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // If this session is set as active, deactivate other sessions
    if (sessionData.isActive) {
      await Session.update(
        { isActive: false },
        { where: { schoolCode, isActive: true } }
      );
    }

    sessionData.schoolCode = schoolCode;
    const session = await Session.create(sessionData);

    return res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create session",
      error: error.message,
    });
  }
};

const getSessionsBySchool = async (req, res) => {
  try {
    const { schoolCode } = req.params;

    const sessions = await Session.findAll({
      where: { schoolCode },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
};



module.exports = {



  createSession,
  getSessionsBySchool,







};
