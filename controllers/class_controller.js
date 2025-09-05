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


// const getClassesBySchoolAndSession = async (req, res) => {
//   try {
//     const { schoolCode, sessionId } = req.params;

//     // Verify session exists and belongs to school
//     const session = await Session.findOne({
//       where: { id: sessionId, schoolCode }
//     });

//     if (!session) {
//       return res.status(404).json({
//         success: false,
//         message: 'Session not found for this school'
//       });
//     }

//     const classes = await Class.findAll({
//       where: { schoolCode, isActive: true },
//       include: [
//         {
//           model: Section,
//           as: 'sections',
//           where: { isActive: true },
//           required: false,
//           include: [
//             {
//               model: AuthUser,
//               as: 'classTeacher',
//               attributes: ['id', 'fullName', 'email']
//             },
//             {
//               model: StudentEnrollment,
//               as: 'students',
//               where: { sessionId, isActive: true },
//               required: false,
//               attributes: ['id', 'rollNumber', 'admissionNumber'],
//               include: [
//                 {
//                   model: AuthUser,
//                   as: 'student',
//                   attributes: ['id', 'fullName']
//                 }
//               ]
//             }
//           ]
//         }
//       ],
//       order: [['level', 'ASC'], [{ model: Section, as: 'sections' }, 'name', 'ASC']]
//     });

//     // Add student count for each section
//     const classesWithCounts = classes.map(classItem => {
//       const classData = classItem.toJSON();
//       classData.sections = classData.sections.map(section => ({
//         ...section,
//         studentCount: section.students ? section.students.length : 0
//       }));
//       return classData;
//     });

//     return res.status(200).json({
//       success: true,
//       data: {
//         session: {
//           id: session.id,
//           name: session.name,
//           startDate: session.startDate,
//           endDate: session.endDate,
//           isActive: session.isActive
//         },
//         classes: classesWithCounts
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching classes by school and session:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch classes',
//       error: error.message
//     });
//   }
// };




module.exports = {
  createClass,
  getClassesBySchool,
  // getClassesBySchoolAndSession
};

