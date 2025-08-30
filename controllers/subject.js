// ============= COMPLETE SUBJECT-TEACHER MANAGEMENT =============

// Additional Controller Functions for Subject-Teacher Management

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

// ============= SUBJECT MANAGEMENT =============

const createSubject = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const { name, code, description, isActive = true } = req.body;

    // Verify school exists
    const school = await School.findOne({ where: { code: schoolCode } });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Check if subject with same code already exists in school
    if (code) {
      const existingSubject = await Subject.findOne({
        where: { schoolCode, code, isActive: true }
      });
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this code already exists'
        });
      }
    }

    const subject = await Subject.create({
      schoolCode,
      name,
      code,
      description,
      isActive
    });

    return res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully'
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create subject',
      error: error.message
    });
  }
};

const getSubjectsBySchool = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const { includeInactive = false } = req.query;

    const whereCondition = { schoolCode };
    if (!includeInactive) {
      whereCondition.isActive = true;
    }

    const subjects = await Subject.findAll({
      where: whereCondition,
      include: [
        {
          model: Class,
          as: 'classes',
          through: { attributes: [] },
          attributes: ['id', 'name', 'level']
        }
      ],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: subjects,
      count: subjects.length
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const updateData = req.body;

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // If updating code, check for duplicates
    if (updateData.code && updateData.code !== subject.code) {
      const existingSubject = await Subject.findOne({
        where: { 
          schoolCode: subject.schoolCode, 
          code: updateData.code, 
          isActive: true,
          id: { [Op.ne]: subjectId }
        }
      });
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this code already exists'
        });
      }
    }

    await subject.update(updateData);

    return res.status(200).json({
      success: true,
      data: subject,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update subject',
      error: error.message
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { hardDelete = false } = req.query;

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if subject is assigned to any active classes or teachers
    const [classAssignments, teacherAssignments] = await Promise.all([
      subject.getClasses({ where: { isActive: true } }),
      SectionSubjectTeacher.findAll({ 
        where: { subjectId, isActive: true } 
      })
    ]);

    if (classAssignments.length > 0 || teacherAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject. It is assigned to active classes or teachers.',
        data: {
          assignedClasses: classAssignments.length,
          assignedTeachers: teacherAssignments.length
        }
      });
    }

    if (hardDelete) {
      await subject.destroy();
    } else {
      await subject.update({ isActive: false });
    }

    return res.status(200).json({
      success: true,
      message: hardDelete ? 'Subject deleted permanently' : 'Subject deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete subject',
      error: error.message
    });
  }
};

// ============= CLASS-SUBJECT ASSIGNMENT =============

const assignSubjectToClass = async (req, res) => {
  try {
    const { classId, subjectIds } = req.body; // subjectIds can be array or single ID

    const classExists = await Class.findByPk(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const subjectIdsArray = Array.isArray(subjectIds) ? subjectIds : [subjectIds];
    
    // Verify all subjects exist and belong to same school
    const subjects = await Subject.findAll({
      where: { 
        id: subjectIdsArray,
        schoolCode: classExists.schoolCode,
        isActive: true 
      }
    });

    if (subjects.length !== subjectIdsArray.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more subjects not found or inactive'
      });
    }

    // Add subjects to class
    await classExists.addSubjects(subjects);

    // Get updated class with subjects
    const updatedClass = await Class.findByPk(classId, {
      include: [
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] },
          where: { isActive: true },
          required: false
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: updatedClass,
      message: 'Subjects assigned to class successfully'
    });
  } catch (error) {
    console.error('Error assigning subjects to class:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign subjects to class',
      error: error.message
    });
  }
};

const removeSubjectFromClass = async (req, res) => {
  try {
    const { classId, subjectId } = req.params;

    const classExists = await Class.findByPk(classId);
    const subject = await Subject.findByPk(subjectId);

    if (!classExists || !subject) {
      return res.status(404).json({
        success: false,
        message: 'Class or Subject not found'
      });
    }

    // Check if there are active teacher assignments for this class-subject combination
    const activeAssignments = await SectionSubjectTeacher.findAll({
      include: [
        {
          model: Section,
          as: 'section',
          where: { classId }
        }
      ],
      where: { subjectId, isActive: true }
    });

    if (activeAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove subject. It has active teacher assignments.',
        data: {
          activeAssignments: activeAssignments.length
        }
      });
    }

    await classExists.removeSubject(subject);

    return res.status(200).json({
      success: true,
      message: 'Subject removed from class successfully'
    });
  } catch (error) {
    console.error('Error removing subject from class:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove subject from class',
      error: error.message
    });
  }
};

const getClassSubjects = async (req, res) => {
  try {
    const { classId } = req.params;

    const classWithSubjects = await Class.findByPk(classId, {
      include: [
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] },
          where: { isActive: true },
          required: false
        },
        {
          model: Section,
          as: 'sections',
          where: { isActive: true },
          required: false,
          include: [
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
                  attributes: ['id', 'fullName', 'email']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!classWithSubjects) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: classWithSubjects
    });
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch class subjects',
      error: error.message
    });
  }
};

// ============= TEACHER-SUBJECT ASSIGNMENT =============

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
          role: { [Op.in]: ['teacher', 'principal'] },
          isActive: true 
        } 
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
          attributes: ['id', 'fullName', 'email', 'mobileNumber']
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

// ============= TEACHER SCHEDULE AND WORKLOAD =============

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

// ============= SECTION MANAGEMENT =============

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

// ============= BULK OPERATIONS =============

const bulkAssignTeachers = async (req, res) => {
  try {
    const { assignments } = req.body; // Array of { sectionId, subjectId, teacherId }

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assignments array is required and must not be empty'
      });
    }

    // Validate all assignments first
    const validationPromises = assignments.map(async (assignment, index) => {
      const { sectionId, subjectId, teacherId } = assignment;
      
      const [section, subject, teacher, existingAssignment] = await Promise.all([
        Section.findOne({ where: { id: sectionId, isActive: true } }),
        Subject.findOne({ where: { id: subjectId, isActive: true } }),
        AuthUser.findOne({ 
          where: { 
            id: teacherId, 
            role: { [Op.in]: ['teacher', 'principal'] },
            isActive: true 
          } 
        }),
        SectionSubjectTeacher.findOne({
          where: { sectionId, subjectId, isActive: true }
        })
      ]);

      if (!section) {
        throw new Error(`Assignment ${index + 1}: Section not found`);
      }
      if (!subject) {
        throw new Error(`Assignment ${index + 1}: Subject not found`);
      }
      if (!teacher) {
        throw new Error(`Assignment ${index + 1}: Teacher not found or not authorized`);
      }
      if (existingAssignment) {
        throw new Error(`Assignment ${index + 1}: Teacher already assigned to this section-subject`);
      }

      return true;
    });

    await Promise.all(validationPromises);

    // If validation passes, create all assignments
    const createdAssignments = await SectionSubjectTeacher.bulkCreate(
      assignments.map(assignment => ({
        ...assignment,
        isActive: true
      })),
      { validate: true, returning: true }
    );

    // Fetch complete assignment details
    const assignmentDetails = await SectionSubjectTeacher.findAll({
      where: { id: createdAssignments.map(a => a.id) },
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
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    return res.status(201).json({
      success: true,
      data: {
        created: createdAssignments.length,
        assignments: assignmentDetails
      },
      message: 'Teachers assigned successfully'
    });
  } catch (error) {
    console.error('Error in bulk assign teachers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk assign teachers',
      error: error.message
    });
  }
};

// ============= ANALYTICS AND REPORTS =============

const getSchoolTeachingAnalytics = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const { sessionId } = req.query;

    const school = await School.findOne({ where: { code: schoolCode } });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Get current session
    let currentSession;
    if (sessionId) {
      currentSession = await Session.findByPk(sessionId);
    } else {
      currentSession = await Session.findOne({
        where: { schoolCode, isActive: true }
      });
    }

    if (!currentSession) {
      return res.status(404).json({
        success: false,
        message: 'No active session found'
      });
    }

    // Get comprehensive analytics
    const [
      totalTeachers,
      totalSubjects,
      totalClasses,
      totalSections,
      totalAssignments,
      unassignedSections,
      teacherWorkload,
      subjectCoverage
    ] = await Promise.all([
      // Total teachers
      AuthUser.count({
        include: [
          {
            model: School,
            as: 'school',
            where: { code: schoolCode }
          }
        ],
        where: { role: { [Op.in]: ['teacher', 'principal'] }, isActive: true }
      }),

      // Total subjects
      Subject.count({ where: { schoolCode, isActive: true } }),

      // Total classes
      Class.count({ where: { schoolCode, isActive: true } }),

      // Total sections
      Section.count({ where: { schoolCode, isActive: true } }),

      // Total active assignments
      SectionSubjectTeacher.count({
        include: [
          {
            model: Section,
            as: 'section',
            where: { schoolCode }
          }
        ],
        where: { isActive: true }
      }),

      // Unassigned sections (sections without teachers for subjects)
      sequelize.query(`
        SELECT s.id, s.name as section_name, c.name as class_name, 
               COUNT(cs.subjectId) as total_subjects,
               COUNT(sst.id) as assigned_subjects,
               (COUNT(cs.subjectId) - COUNT(sst.id)) as unassigned_subjects
        FROM sections s
        JOIN classes c ON s.classId = c.id
        JOIN ClassSubjects cs ON c.id = cs.classId
        LEFT JOIN section_subject_teachers sst ON s.id = sst.sectionId 
                                                AND cs.subjectId = sst.subjectId 
                                                AND sst.isActive = 1
        WHERE s.schoolCode = :schoolCode AND s.isActive = 1
        GROUP BY s.id, s.name, c.name
        HAVING unassigned_subjects > 0
      `, {
        replacements: { schoolCode },
        type: sequelize.QueryTypes.SELECT
      }),

      // Teacher workload distribution
      SectionSubjectTeacher.findAll({
        include: [
          {
            model: AuthUser,
            as: 'teacher',
            attributes: ['id', 'fullName', 'email']
          },
          {
            model: Section,
            as: 'section',
            where: { schoolCode },
            include: [
              {
                model: StudentEnrollment,
                as: 'students',
                where: { sessionId: currentSession.id, isActive: true },
                attributes: ['id'],
                required: false
              }
            ]
          }
        ],
        where: { isActive: true },
        attributes: [
          'teacherId',
          [sequelize.fn('COUNT', sequelize.col('SectionSubjectTeacher.id')), 'assignmentCount']
        ],
        group: ['teacherId']
      }),

      // Subject coverage across school
      Subject.findAll({
        where: { schoolCode, isActive: true },
        include: [
          {
            model: SectionSubjectTeacher,
            as: 'sectionTeachers',
            where: { isActive: true },
            required: false,
            include: [
              {
                model: Section,
                as: 'section',
                include: [
                  {
                    model: Class,
                    as: 'class',
                    attributes: ['name', 'level']
                  }
                ]
              }
            ]
          }
        ]
      })
    ]);

    // Process teacher workload data
    const workloadAnalysis = teacherWorkload.reduce((acc, teacher) => {
      const count = parseInt(teacher.dataValues.assignmentCount);
      if (count <= 3) acc.light++;
      else if (count <= 6) acc.moderate++;
      else if (count <= 10) acc.heavy++;
      else acc.overloaded++;
      return acc;
    }, { light: 0, moderate: 0, heavy: 0, overloaded: 0 });

    // Process subject coverage
    const subjectAnalysis = subjectCoverage.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      totalAssignments: subject.sectionTeachers.length,
      classesOffered: [...new Set(subject.sectionTeachers.map(st => st.section.class.name))],
      isFullyCovered: subject.sectionTeachers.length > 0
    }));

    const uncoveredSubjects = subjectAnalysis.filter(s => !s.isFullyCovered);

    return res.status(200).json({
      success: true,
      data: {
        school: {
          code: school.code,
          name: school.name
        },
        session: {
          id: currentSession.id,
          name: currentSession.name
        },
        overview: {
          totalTeachers,
          totalSubjects,
          totalClasses,
          totalSections,
          totalAssignments,
          unassignedCount: unassignedSections.length
        },
        teacherWorkload: {
          distribution: workloadAnalysis,
          details: teacherWorkload
        },
        subjectCoverage: {
          total: subjectCoverage.length,
          covered: subjectCoverage.length - uncoveredSubjects.length,
          uncovered: uncoveredSubjects.length,
          uncoveredSubjects,
          details: subjectAnalysis
        },
        unassignedSections
      }
    });
  } catch (error) {
    console.error('Error fetching teaching analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teaching analytics',
      error: error.message
    });
  }
};

// ============= ADDITIONAL ROUTES =============

// Add these routes to your existing router
const additionalRoutes = `
// Subject Management Routes
router.post('/:schoolCode/subjects', createSubject);
router.get('/:schoolCode/subjects', getSubjectsBySchool);
router.put('/subjects/:subjectId', updateSubject);
router.delete('/subjects/:subjectId', deleteSubject);

// Class-Subject Assignment Routes
router.post('/classes/assign-subjects', assignSubjectToClass);
router.delete('/classes/:classId/subjects/:subjectId', removeSubjectFromClass);
router.get('/classes/:classId/subjects', getClassSubjects);

// Teacher-Subject Assignment Routes
router.post('/assign-teacher-subject', assignTeacherToSectionSubject);
router.put('/assignments/:assignmentId', updateTeacherAssignment);
router.delete('/assignments/:assignmentId', removeTeacherAssignment);

// Teacher Schedule Routes
router.get('/teachers/:teacherId/schedule', getTeacherSchedule);
router.get('/subjects/:subjectId/teachers', getTeachersBySubject);
router.get('/sections/:sectionId/teachers', getSectionTeachers);

// Bulk Operations Routes
router.post('/bulk-assign-teachers', bulkAssignTeachers);

// Analytics Routes
router.get('/:schoolCode/teaching-analytics', getSchoolTeachingAnalytics);
`;

// ============= COMPLETE API EXAMPLES =============

/*
COMPREHENSIVE API USAGE EXAMPLES:

1. Create Subject:
POST /schools/DPS001/subjects
{
  "name": "Mathematics",
  "code": "MATH",
  "description": "Core mathematics curriculum"
}

2. Get All Subjects for School:
GET /schools/DPS001/subjects

3. Assign Multiple Subjects to Class:
POST /schools/classes/assign-subjects
{
  "classId": 1,
  "subjectIds": [1, 2, 3, 4, 5]  // Math, English, Science, Social Studies, Hindi
}

4. Assign Teacher to Section-Subject:
POST /schools/assign-teacher-subject
{
  "sectionId": 1,
  "subjectId": 1,
  "teacherId": 5
}

5. Get Teacher's Complete Schedule:
GET /schools/teachers/5/schedule?schoolCode=DPS001&sessionId=1

Response:
{
  "success": true,
  "data": {
    "teacher": {
      "id": 5,
      "fullName": "Mrs. Priya Sharma",
      "email": "priya@dps.edu.in",
      "role": "teacher"
    },
    "workloadStats": {
      "totalAssignments": 8,
      "totalClasses": 3,
      "totalSections": 4,
      "totalSubjects": 2,
      "totalStudents": 120
    },
    "schedule": [
      {
        "class": {
          "id": 1,
          "name": "Class 1",
          "level": 1
        },
        "section": {
          "id": 1,
          "name": "A",
          "room": "Room 101",
          "capacity": 30,
          "studentCount": 28
        },
        "subjects": [
          {
            "id": 1,
            "name": "Mathematics",
            "code": "MATH",
            "assignmentId": 1
          },
          {
            "id": 2,
            "name": "English",
            "code": "ENG",
            "assignmentId": 2
          }
        ]
      }
    ]
  }
}

6. Get Teachers by Subject:
GET /schools/subjects/1/teachers?schoolCode=DPS001

7. Get Section Teachers (Class Teacher + Subject Teachers):
GET /schools/sections/1/teachers

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "A",
    "room": "Room 101",
    "class": {
      "id": 1,
      "name": "Class 1",
      "level": 1
    },
    "classTeacher": {
      "id": 5,
      "fullName": "Mrs. Priya Sharma",
      "email": "priya@dps.edu.in"
    },
    "subjectTeachers": [
      {
        "id": 1,
        "subject": {
          "id": 1,
          "name": "Mathematics",
          "code": "MATH"
        },
        "teacher": {
          "id": 5,
          "fullName": "Mrs. Priya Sharma",
          "email": "priya@dps.edu.in"
        }
      },
      {
        "id": 2,
        "subject": {
          "id": 3,
          "name": "Science",
          "code": "SCI"
        },
        "teacher": {
          "id": 7,
          "fullName": "Mr. Rajesh Kumar",
          "email": "rajesh@dps.edu.in"
        }
      }
    ]
  }
}

8. Bulk Assign Teachers:
POST /schools/bulk-assign-teachers
{
  "assignments": [
    {
      "sectionId": 1,
      "subjectId": 1,
      "teacherId": 5
    },
    {
      "sectionId": 1,
      "subjectId": 2,
      "teacherId": 6
    },
    {
      "sectionId": 2,
      "subjectId": 1,
      "teacherId": 5
    }
  ]
}

9. Get Teaching Analytics:
GET /schools/DPS001/teaching-analytics?sessionId=1

Response:
{
  "success": true,
  "data": {
    "school": {
      "code": "DPS001",
      "name": "Delhi Public School"
    },
    "overview": {
      "totalTeachers": 15,
      "totalSubjects": 8,
      "totalClasses": 5,
      "totalSections": 12,
      "totalAssignments": 48,
      "unassignedCount": 3
    },
    "teacherWorkload": {
      "distribution": {
        "light": 3,     // 1-3 assignments
        "moderate": 8,  // 4-6 assignments
        "heavy": 3,     // 7-10 assignments
        "overloaded": 1 // 10+ assignments
      }
    },
    "subjectCoverage": {
      "total": 8,
      "covered": 7,
      "uncovered": 1,
      "uncoveredSubjects": [
        {
          "id": 8,
          "name": "Art",
          "code": "ART",
          "totalAssignments": 0,
          "isFullyCovered": false
        }
      ]
    },
    "unassignedSections": [
      {
        "id": 3,
        "section_name": "C",
        "class_name": "Class 2",
        "total_subjects": 5,
        "assigned_subjects": 3,
        "unassigned_subjects": 2
      }
    ]
  }
}

10. Update Teacher Assignment:
PUT /schools/assignments/1
{
  "teacherId": 8,  // Change teacher
  "isActive": true
}

11. Remove Teacher Assignment:
DELETE /schools/assignments/1?hardDelete=false

12. Get Class Subjects with Teacher Assignments:
GET /schools/classes/1/subjects

ADDITIONAL HELPER FUNCTIONS:

// Get Available Teachers for Assignment
const getAvailableTeachers = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const { subjectId, excludeAssigned = false } = req.query;

    let whereCondition = {
      role: { [Op.in]: ['teacher', 'principal'] },
      isActive: true
    };

    const includeCondition = [
      {
        model: School,
        as: 'school',
        where: { code: schoolCode }
      }
    ];

    if (excludeAssigned && subjectId) {
      // Exclude teachers already assigned to this subject
      const assignedTeachers = await SectionSubjectTeacher.findAll({
        where: { subjectId, isActive: true },
        attributes: ['teacherId']
      });
      
      const assignedTeacherIds = assignedTeachers.map(a => a.teacherId);
      if (assignedTeacherIds.length > 0) {
        whereCondition.id = { [Op.notIn]: assignedTeacherIds };
      }
    }

    const teachers = await AuthUser.findAll({
      where: whereCondition,
      include: includeCondition,
      attributes: ['id', 'fullName', 'email', 'mobileNumber', 'qualification'],
      order: [['fullName', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error('Error fetching available teachers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available teachers',
      error: error.message
    });
  }
};

// Get Unassigned Section-Subject Combinations
const getUnassignedCombinations = async (req, res) => {
  try {
    const { schoolCode } = req.params;

    const unassigned = await sequelize.query(`
      SELECT 
        s.id as sectionId,
        s.name as sectionName,
        c.id as classId,
        c.name as className,
        c.level as classLevel,
        sub.id as subjectId,
        sub.name as subjectName,
        sub.code as subjectCode
      FROM sections s
      JOIN classes c ON s.classId = c.id
      JOIN ClassSubjects cs ON c.id = cs.classId
      JOIN subjects sub ON cs.subjectId = sub.id
      LEFT JOIN section_subject_teachers sst ON s.id = sst.sectionId 
                                            AND sub.id = sst.subjectId 
                                            AND sst.isActive = 1
      WHERE s.schoolCode = :schoolCode 
        AND s.isActive = 1 
        AND sub.isActive = 1
        AND sst.id IS NULL
      ORDER BY c.level, s.name, sub.name
    `, {
      replacements: { schoolCode },
      type: sequelize.QueryTypes.SELECT
    });

    // Group by section
    const groupedUnassigned = unassigned.reduce((acc, item) => {
      const sectionKey = `${item.sectionId}`;
      
      if (!acc[sectionKey]) {
        acc[sectionKey] = {
          section: {
            id: item.sectionId,
            name: item.sectionName,
            class: {
              id: item.classId,
              name: item.className,
              level: item.classLevel
            }
          },
          unassignedSubjects: []
        };
      }

      acc[sectionKey].unassignedSubjects.push({
        id: item.subjectId,
        name: item.subjectName,
        code: item.subjectCode
      });

      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        totalUnassigned: unassigned.length,
        sections: Object.values(groupedUnassigned)
      }
    });
  } catch (error) {
    console.error('Error fetching unassigned combinations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unassigned combinations',
      error: error.message
    });
  }
};

// Additional Routes for Helper Functions
router.get('/:schoolCode/available-teachers', getAvailableTeachers);
router.get('/:schoolCode/unassigned-combinations', getUnassignedCombinations);
*/

module.exports = {
  // Original functions
  createSchool,
  getSchoolByCode,
  createSession,
  getSessionsBySchool,
  createClass,
  getClassesBySchool,
  createSection,
  getSectionsByClass,
  enrollStudent,
  getStudentsBySection,
  getCompleteSchoolStructure,
  
  // Subject Management
  createSubject,
  getSubjectsBySchool,
  updateSubject,
  deleteSubject,
  
  // Class-Subject Assignment
  assignSubjectToClass,
  removeSubjectFromClass,
  getClassSubjects,
  
  // Teacher-Subject Assignment
  assignTeacherToSectionSubject,
  updateTeacherAssignment,
  removeTeacherAssignment,
  
  // Teacher Schedule & Management
  getTeacherSchedule,
  getTeachersBySubject,
  getSectionTeachers,
  
  // Bulk Operations
  bulkAssignTeachers,
  bulkEnrollStudents,
  
  // Analytics
  getSchoolTeachingAnalytics,
  getSchoolStatistics
};