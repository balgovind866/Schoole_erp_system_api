// controllers/school_controller.js
const db = require("../models");
const School = db.SchoolAll;
const Session = db.Session;
const Class = db.Class;
const Section = db.Section;
const Subject = db.Subject;
const AuthUser = db.AuthUser;
const StudentEnrollment = db.StudentEnrollment;
const SectionSubjectTeacher = db.SectionSubjectTeacher;





// Section Controllers
const createSection = async (req, res) => {
  try {
    const { schoolCode, classId } = req.params;
    const sectionData = { ...req.body, schoolCode, classId: parseInt(classId) };

    // Verify class exists
    const classExists = await Class.findOne({
      where: { id: classId, schoolCode },
    });

    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const section = await Section.create(sectionData);

    return res.status(201).json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Error creating section:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create section",
      error: error.message,
    });
  }
};

const getSectionsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const sections = await Section.findAll({
      where: { classId, isActive: true },
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["name", "level"],
        },
        {
          model: AuthUser,
          as: "classTeacher",
          attributes: ["id", "fullName", "email", "mobileNumber"],
        },
      ],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sections",
      error: error.message,
    });
  }
};





module.exports = {




 

  // Section
  createSection,
  getSectionsByClass,


};
