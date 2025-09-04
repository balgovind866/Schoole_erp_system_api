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

// Class Controllers
const createClass = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const classData = { ...req.body, schoolCode };

    const newClass = await Class.create(classData);

    return res.status(201).json({
      success: true,
      data: newClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create class",
      error: error.message,
    });
  }
};

const getClassesBySchool = async (req, res) => {
  try {
    const { schoolCode } = req.params;

    const classes = await Class.findAll({
      where: { schoolCode, isActive: true },
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
          ],
        },
      ],
      order: [
        ["level", "ASC"],
        [{ model: Section, as: "sections" }, "name", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
      error: error.message,
    });
  }
};

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

// Student Enrollment Controllers
const enrollStudent = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const {
      studentId,
      sessionId,
      classId,
      sectionId,
      rollNumber,
      admissionNumber,
    } = req.body;

    // Verify all entities exist
    const [student, session, classExists, section] = await Promise.all([
      AuthUser.findByPk(studentId),
      Session.findByPk(sessionId),
      Class.findByPk(classId),
      Section.findByPk(sectionId),
    ]);

    if (!student || !session || !classExists || !section) {
      return res.status(404).json({
        success: false,
        message: "One or more entities not found",
      });
    }

    const enrollment = await StudentEnrollment.create({
      studentId,
      sessionId,
      classId,
      sectionId,
      rollNumber,
      admissionNumber,
    });

    const enrollmentWithDetails = await StudentEnrollment.findByPk(
      enrollment.id,
      {
        include: [
          {
            model: AuthUser,
            as: "student",
            attributes: ["id", "fullName", "email", "mobileNumber"],
          },
          {
            model: Session,
            as: "session",
            attributes: ["id", "name", "startDate", "endDate"],
          },
          {
            model: Class,
            as: "class",
            attributes: ["id", "name", "level"],
          },
          {
            model: Section,
            as: "section",
            attributes: ["id", "name", "room"],
          },
        ],
      }
    );

    return res.status(201).json({
      success: true,
      data: enrollmentWithDetails,
    });
  } catch (error) {
    console.error("Error enrolling student:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enroll student",
      error: error.message,
    });
  }
};

const getStudentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { sessionId } = req.query;

    const whereCondition = { sectionId, isActive: true };
    if (sessionId) {
      whereCondition.sessionId = sessionId;
    }

    const students = await StudentEnrollment.findAll({
      where: whereCondition,
      include: [
        {
          model: AuthUser,
          as: "student",
          attributes: [
            "id",
            "fullName",
            "email",
            "mobileNumber",
            "parentName",
            "parentPhone",
          ],
        },
        {
          model: Session,
          as: "session",
          attributes: ["id", "name"],
        },
      ],
      order: [["rollNumber", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
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

  // Session
  createSession,
  getSessionsBySchool,

  // Class
  createClass,
  getClassesBySchool,

  // Section
  createSection,
  getSectionsByClass,

  // Student Enrollment
  enrollStudent,
  getStudentsBySection,

  // Complete Structure
  getCompleteSchoolStructure,
};
