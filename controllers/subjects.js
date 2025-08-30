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



const assignSubjectToClass = async (req, res) => {
  try {
    const { classId, subjectIds } = req.body; // subjectIds can be array or single ID

    const classExists = await Class.findByPk(classId);
    console.log('class exits ', classExists);
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
    console.log("dyddfhdfdks subject hai" ,subjects);

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


module.exports={
    createSubject,
    getSubjectsBySchool,
    updateSubject,
    deleteSubject,
    assignSubjectToClass,
    removeSubjectFromClass,
    getClassSubjects
}