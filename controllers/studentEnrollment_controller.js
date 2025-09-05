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
            // "parentName",
            // "parentPhone",
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



module.exports = {


 

  // Student Enrollment
  enrollStudent,
  getStudentsBySection,

};
