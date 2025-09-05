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

// School Controllers
const createSchool = async (req, res) => {
  try {
    const school = await School.create(req.body);
    return res.status(201).json({
      success: true,
      data: school,
    });
  } catch (error) {
    console.error("Error creating school:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create school",
      error: error.message,
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
          as: "sessions",
          where: { isActive: true },
          required: false,
        },
        {
          model: Class,
          as: "classes",
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Section,
              as: "sections",
              where: { isActive: true },
              required: false,
            },
          ],
        },
      ],
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: school,
    });
  } catch (error) {
    console.error("Error fetching school:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch school",
      error: error.message,
    });
  }
};
// delete school
const deleteSchoolByCode = async (req, res) => {
  try {
    const { schoolCode } = req.params;

    const deletedSchool = await School.destroy({
      where: { code: schoolCode }, // Corrected line
    });
    if (!deletedSchool) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deletedSchool,
    });
  } catch (error) {
    console.error("Error fetching school:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch school",
      error: error.message,
    });
  }
};

//update school info
const updateSchoolByCode = async (req, res) => {
  const { schoolCode } = req.params;
  const {
    name,
    baseUrl,
    logoPath,
    bannerPath,
    paymentLink,
    address,
    phone,
    email,
    principalName,
    establishedYear,
  } = req.body;

  try {
    const [rowsUpdated] = await School.update(
      {
        name,
        baseUrl,
        logoPath,
        bannerPath,
        paymentLink,
        address,
        phone,
        email,
        principalName,
        establishedYear,
      },
      {
        where: {
          code: schoolCode,
        },
      }
    );
    if (rowsUpdated === 1) {
      return res.status(200).json({
        success: true,
        message: "School updated successfully.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "School not found or no changes were made.",
      });
    }
  } catch (error) {
    console.error("Error updating school:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update school due to a server error.",
      error: error.message,
    });
  }
};



// Complete School Structure
const getCompleteSchoolStructure = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const { sessionId } = req.query;

    const whereCondition = { code: schoolCode };

    const school = await School.findOne({
      where: whereCondition,
      include: [
        {
          model: Session,
          as: "sessions",
          where: sessionId ? { id: sessionId } : { isActive: true },
          required: false,
        },
        {
          model: Class,
          as: "classes",
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Section,
              as: "sections",
              where: { isActive: true },
              required: false,
              include: [
                {
                  model: AuthUser,
                  as: "classTeacher",
                  attributes: ["id", "fullName", "email"],
                },
                {
                  model: StudentEnrollment,
                  as: "students",
                  where: sessionId
                    ? { sessionId, isActive: true }
                    : { isActive: true },
                  required: false,
                  include: [
                    {
                      model: AuthUser,
                      as: "student",
                      attributes: ["id", "fullName", "rollNumber"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: Class, as: "classes" }, "level", "ASC"],
        [
          { model: Class, as: "classes" },
          { model: Section, as: "sections" },
          "name",
          "ASC",
        ],
      ],
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: school,
    });
  } catch (error) {
    console.error("Error fetching complete school structure:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch school structure",
      error: error.message,
    });
  }
};

module.exports = {
  // School
  createSchool,
  getSchoolByCode,
  deleteSchoolByCode,
  updateSchoolByCode,



  // Complete Structure
  getCompleteSchoolStructure,
};
