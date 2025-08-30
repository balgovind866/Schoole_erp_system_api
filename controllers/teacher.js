const { Op, sequelize } = require('sequelize');
const db = require("../models");
const School = db.SchoolAll;
const Session = db.Session;
const Class = db.Class;
const Section = db.Section;
const Subject = db.Subject;
const AuthUser = db.AuthUser;
const StudentEnrollment = db.StudentEnrollment;
const SectionSubjectTeacher = db.SectionSubjectTeacher;

const assignTeacherToSectionSubject = async (req, res) => {
  try {
    const { sectionId, subjectId, teacherId } = req.body;

    // Verify all entities exist and are valid
    const [section, subject, teacher] = await Promise.all([
      Section.findOne({
        where: { id: sectionId, isActive: true },
        include: [
          {
            model: Class,
            as: 'class',
            include: [
              {
                model: Subject,
                as: 'subjects',
                through: { attributes: [] },
                where: { id: subjectId }
              }
            ]
          }
        ]
      }),
      Subject.findOne({ where: { id: subjectId, isActive: true } }),
      AuthUser.findOne({ 
        where: { 
          id: teacherId, 
          role: { [Op.in]: ['teacher'] },
          isActive: true 
        },
        attributes: ['id', 'fullName', 'email', 'mobileNumber'] // ✅ keep only required fields
      })
    ]);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found or inactive'
      });
    }

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or inactive'
      });
    }

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found or not authorized to teach'
      });
    }

    // Check if subject is assigned to the class
    if (!section.class.subjects || section.class.subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject is not assigned to this class'
      });
    }

    // Check if teacher is already assigned to this section-subject combination
    const existingAssignment = await SectionSubjectTeacher.findOne({
      where: { sectionId, subjectId, isActive: true }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'A teacher is already assigned to this section-subject combination',
        data: {
          currentTeacherId: existingAssignment.teacherId
        }
      });
    }

    // Create the assignment
    const assignment = await SectionSubjectTeacher.create({
      sectionId,
      subjectId,
      teacherId,
      isActive: true
    });

    // Fetch complete assignment details
    const assignmentWithDetails = await SectionSubjectTeacher.findByPk(assignment.id, {
      include: [
        {
          model: Section,
          as: 'section',
          include: [
            {
              model: Class,
              as: 'class',
              attributes: ['id', 'name', 'level']
            }
          ],
          attributes: ['id', 'name', 'room']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        {
          model: AuthUser,
          as: 'teacher',
          attributes: ['id', 'fullName', 'email', 'mobileNumber'] // ✅ no profile fields
        }
      ]
    });

    return res.status(201).json({
      success: true,
      data: assignmentWithDetails,
      message: 'Teacher assigned to section-subject successfully'
    });
  } catch (error) {
    console.error('Error assigning teacher to section-subject:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign teacher',
      error: error.message
    });
  }
};


const updateTeacherAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { teacherId, isActive } = req.body;

    const assignment = await SectionSubjectTeacher.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // If changing teacher, verify new teacher exists and is valid
    if (teacherId && teacherId !== assignment.teacherId) {
      const teacher = await AuthUser.findOne({
        where: { 
          id: teacherId, 
          role: { [Op.in]: ['teacher', 'principal'] },
          isActive: true 
        }
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'New teacher not found or not authorized'
        });
      }

      // Check if new teacher is already assigned to this section-subject
      const conflictingAssignment = await SectionSubjectTeacher.findOne({
        where: { 
          sectionId: assignment.sectionId,
          subjectId: assignment.subjectId,
          teacherId,
          isActive: true,
          id: { [Op.ne]: assignmentId }
        }
      });

      if (conflictingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'This teacher is already assigned to this section-subject combination'
        });
      }
    }

    const updateData = {};
    if (teacherId !== undefined) updateData.teacherId = teacherId;
    if (isActive !== undefined) updateData.isActive = isActive;

    await assignment.update(updateData);

    // Fetch updated assignment with details
    const updatedAssignment = await SectionSubjectTeacher.findByPk(assignmentId, {
      include: [
        {
          model: Section,
          as: 'section',
          include: [
            {
              model: Class,
              as: 'class',
              attributes: ['id', 'name', 'level']
            }
          ],
          attributes: ['id', 'name', 'room']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        {
          model: AuthUser,
          as: 'teacher',
          attributes: ['id', 'fullName', 'email', 'mobileNumber']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: updatedAssignment,
      message: 'Teacher assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating teacher assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update teacher assignment',
      error: error.message
    });
  }
};

const removeTeacherAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { hardDelete = false } = req.query;

    const assignment = await SectionSubjectTeacher.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (hardDelete === 'true') {
      await assignment.destroy();
    } else {
      await assignment.update({ isActive: false });
    }

    return res.status(200).json({
      success: true,
      message: hardDelete === 'true' ? 'Assignment deleted permanently' : 'Assignment deactivated successfully'
    });
  } catch (error) {
    console.error('Error removing teacher assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove teacher assignment',
      error: error.message
    });
  }
};

const getTeacherSchedule = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { schoolCode, sessionId } = req.query;

    // Verify teacher exists
    const teacher = await AuthUser.findOne({
      where: { 
        id: teacherId, 
        role: { [Op.in]: ['teacher', 'principal'] },
        isActive: true 
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const whereCondition = { teacherId, isActive: true };

    const schedule = await SectionSubjectTeacher.findAll({
      where: whereCondition,
      include: [
        {
          model: Section,
          as: 'section',
          where: schoolCode ? { schoolCode } : undefined,
          include: [
            {
              model: Class,
              as: 'class',
              attributes: ['id', 'name', 'level']
            },
            {
              model: StudentEnrollment,
              as: 'students',
              where: sessionId ? { sessionId, isActive: true } : { isActive: true },
              attributes: ['id'],
              required: false
            }
          ],
          attributes: ['id', 'name', 'room', 'capacity']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [
        [{ model: Section, as: 'section' }, { model: Class, as: 'class' }, 'level', 'ASC'],
        [{ model: Section, as: 'section' }, 'name', 'ASC'],
        [{ model: Subject, as: 'subject' }, 'name', 'ASC']
      ]
    });

    // Calculate workload statistics
    const workloadStats = {
      totalAssignments: schedule.length,
      totalClasses: [...new Set(schedule.map(s => s.section.class.id))].length,
      totalSections: [...new Set(schedule.map(s => s.section.id))].length,
      totalSubjects: [...new Set(schedule.map(s => s.subject.id))].length,
      totalStudents: schedule.reduce((sum, assignment) => 
        sum + (assignment.section.students ? assignment.section.students.length : 0), 0
      )
    };

    // Group by class and subject for better organization
    const organizedSchedule = schedule.reduce((acc, assignment) => {
      const className = assignment.section.class.name;
      const sectionName = assignment.section.name;
      const key = `${className}-${sectionName}`;

      if (!acc[key]) {
        acc[key] = {
          class: assignment.section.class,
          section: {
            id: assignment.section.id,
            name: assignment.section.name,
            room: assignment.section.room,
            capacity: assignment.section.capacity,
            studentCount: assignment.section.students ? assignment.section.students.length : 0
          },
          subjects: []
        };
      }

      acc[key].subjects.push({
        id: assignment.subject.id,
        name: assignment.subject.name,
        code: assignment.subject.code,
        assignmentId: assignment.id
      });

      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          fullName: teacher.fullName,
          email: teacher.email,
          role: teacher.role
        },
        workloadStats,
        schedule: Object.values(organizedSchedule),
        rawSchedule: schedule
      }
    });
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher schedule',
      error: error.message
    });
  }
};

const getTeachersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { schoolCode, sessionId } = req.query;

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const teachers = await SectionSubjectTeacher.findAll({
      where: { subjectId, isActive: true },
      include: [
        {
          model: AuthUser,
          as: 'teacher',
          attributes: ['id', 'fullName', 'email', 'mobileNumber', 'qualification']
        },
        {
          model: Section,
          as: 'section',
          where: schoolCode ? { schoolCode } : undefined,
          include: [
            {
              model: Class,
              as: 'class',
              attributes: ['id', 'name', 'level']
            },
            {
              model: StudentEnrollment,
              as: 'students',
              where: sessionId ? { sessionId, isActive: true } : { isActive: true },
              attributes: ['id'],
              required: false
            }
          ],
          attributes: ['id', 'name', 'room']
        }
      ],
      order: [
        [{ model: AuthUser, as: 'teacher' }, 'fullName', 'ASC'],
        [{ model: Section, as: 'section' }, { model: Class, as: 'class' }, 'level', 'ASC']
      ]
    });

    // Group by teacher
    const teacherGroups = teachers.reduce((acc, assignment) => {
      const teacherId = assignment.teacher.id;
      
      if (!acc[teacherId]) {
        acc[teacherId] = {
          teacher: assignment.teacher,
          sections: [],
          totalStudents: 0
        };
      }

      const sectionData = {
        id: assignment.section.id,
        name: assignment.section.name,
        room: assignment.section.room,
        class: assignment.section.class,
        studentCount: assignment.section.students ? assignment.section.students.length : 0
      };

      acc[teacherId].sections.push(sectionData);
      acc[teacherId].totalStudents += sectionData.studentCount;

      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.code
        },
        teachers: Object.values(teacherGroups)
      }
    });
  } catch (error) {
    console.error('Error fetching teachers by subject:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers by subject',
      error: error.message
    });
  }
};
const getSectionTeachers = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findByPk(sectionId, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'level']
        },
        {
          model: AuthUser,
          as: 'classTeacher',
          attributes: ['id', 'fullName', 'email', 'mobileNumber']
        },
        {
          model: SectionSubjectTeacher,
          as: 'subjectTeachers',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Subject,
              as: 'subject',
              attributes: ['id', 'name', 'code']
            },
            {
              model: AuthUser,
              as: 'teacher',
              attributes: ['id', 'fullName', 'email', 'mobileNumber']
            }
          ]
        }
      ]
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error('Error fetching section teachers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch section teachers',
      error: error.message
    });
  }
};

 module.exports={
    assignTeacherToSectionSubject,
    updateTeacherAssignment,
    removeTeacherAssignment,
    getTeacherSchedule,
    getTeachersBySubject,
    getSectionTeachers,
 }