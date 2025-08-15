const db = require("../models");
const Notice = db.Notice;
const SchoolAll = db.SchoolAll;
const AuthUser = db.AuthUser;
const Session = db.Session;
const Class = db.Class;
const Section = db.Section;
const NoticeRead = db.NoticeRead;
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Create a new notice
const createNotice = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const noticeData = req.body;
    const userId = req.user.id; // From auth middleware

    // Verify school exists
    const school = await SchoolAll.findOne({
      where: { code: schoolCode }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Add required fields
    noticeData.schoolId = school.id;
    noticeData.authorId = userId;

    // Handle file attachment if provided
    if (req.file) {
      noticeData.attachmentPath = req.file.path;
      noticeData.attachmentName = req.file.originalname;
    }

    const notice = await Notice.create(noticeData);

    // Fetch the created notice with associations
    const createdNotice = await Notice.findByPk(notice.id, {
  include: [
    {
      model: AuthUser,
      as: 'author',
      attributes: ['id', 'fullName', 'email'] // ✅ Correct fields
    },
    {
      model: SchoolAll,
      as: 'school',
      attributes: ['id', 'name', 'code']
    }
  ]
});


    return res.status(201).json({
      success: true,
      data: createdNotice,
      message: 'Notice created successfully'
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create notice',
      error: error.message
    });
  }
};

// Get all notices for a school with filtering and pagination
const getNotices = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const {
      page = 1,
      limit = 10,
      noticeType,
      priority,
      targetAudience,
      isPublished,
      isPinned,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Verify school exists
    const school = await SchoolAll.findOne({
      where: { code: schoolCode }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Build where clause
    const whereClause = {
      schoolId: school.id,
      isActive: true
    };

    // Add filters
    if (noticeType) whereClause.noticeType = noticeType;
    if (priority) whereClause.priority = priority;
    if (targetAudience) whereClause.targetAudience = targetAudience;
    if (isPublished !== undefined) whereClause.isPublished = isPublished === 'true';
    if (isPinned !== undefined) whereClause.isPinned = isPinned === 'true';

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Add published filter (only show published notices unless specifically requested)
    if (isPublished === undefined) {
      whereClause.isPublished = true;
      whereClause[Op.and] = [
        {
          [Op.or]: [
            { publishDate: null },
            { publishDate: { [Op.lte]: new Date() } }
          ]
        },
        {
          [Op.or]: [
            { expiryDate: null },
            { expiryDate: { [Op.gte]: new Date() } }
          ]
        }
      ];
    }

    const offset = (page - 1) * limit;

    // Build order clause (pinned notices first)
    const orderClause = isPinned === 'true' 
      ? [['pinOrder', 'ASC'], ['createdAt', 'DESC']]
      : [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows: notices } = await Notice.findAndCountAll({
      where: whereClause,
      include: [
        { model: AuthUser, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: AuthUser, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: SchoolAll, as: 'school', attributes: ['id', 'name', 'code'] },
        { model: Session, as: 'session', attributes: ['id', 'name', 'startDate', 'endDate'] },
        { model: Class, as: 'targetClass', attributes: ['id', 'name'] },
        { model: Section, as: 'targetSection', attributes: ['id', 'name'] }
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: {
        notices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notices',
      error: error.message
    });
  }
};

// Get a single notice by ID
const getNoticeById = async (req, res) => {
  try {
    const { schoolCode, noticeId } = req.params;
    const userId = req.user?.id;

    // Verify school exists
    const school = await SchoolAll.findOne({
      where: { code: schoolCode }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const notice = await Notice.findOne({
      where: {
        id: noticeId,
        schoolId: school.id,
        isActive: true
      },
      include: [
        { model: AuthUser, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: AuthUser, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: SchoolAll, as: 'school', attributes: ['id', 'name', 'code'] },
        { model: Session, as: 'session', attributes: ['id', 'name', 'startDate', 'endDate'] },
        { model: Class, as: 'targetClass', attributes: ['id', 'name'] },
        { model: Section, as: 'targetSection', attributes: ['id', 'name'] },
        { model: NoticeRead, as: 'reads', attributes: ['id', 'userId', 'readAt'] }
      ]
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Increment view count
    await notice.increment('totalViews');

    // Track read status if user is logged in
    if (userId && NoticeRead) {
      await NoticeRead.findOrCreate({
        where: {
          noticeId: notice.id,
          userId: userId
        },
        defaults: {
          noticeId: notice.id,
          userId: userId,
          readAt: new Date()
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Error fetching notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notice',
      error: error.message
    });
  }
};

// Update a notice
const updateNotice = async (req, res) => {
  try {
    const { schoolCode, noticeId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Verify school exists
    const school = await SchoolAll.findOne({
      where: { code: schoolCode }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const notice = await Notice.findOne({
      where: {
        id: noticeId,
        schoolId: school.id,
        isActive: true
      }
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user has permission to update (author or admin)
    if (notice.authorId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Handle file attachment update
    if (req.file) {
      // Delete old attachment if exists
      if (notice.attachmentPath && fs.existsSync(notice.attachmentPath)) {
        fs.unlinkSync(notice.attachmentPath);
      }
      updateData.attachmentPath = req.file.path;
      updateData.attachmentName = req.file.originalname;
    }

    await notice.update(updateData);

    // Fetch updated notice with associations
    const updatedNotice = await Notice.findByPk(notice.id, {
      include: [
        { model: AuthUser, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: AuthUser, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: SchoolAll, as: 'school', attributes: ['id', 'name', 'code'] }
      ]
    });

    return res.status(200).json({
      success: true,
      data: updatedNotice,
      message: 'Notice updated successfully'
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notice',
      error: error.message
    });
  }
};

// Delete a notice
const deleteNotice = async (req, res) => {
  try {
    const { schoolCode, noticeId } = req.params;
    const userId = req.user.id;

    // Verify school exists
    const school = await SchoolAll.findOne({
      where: { code: schoolCode }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const notice = await Notice.findOne({
      where: {
        id: noticeId,
        schoolId: school.id,
        isActive: true
      }
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user has permission to delete (author or admin)
    if (notice.authorId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Soft delete
    await notice.update({ isActive: false });

    // Delete attachment file if exists
    if (notice.attachmentPath && fs.existsSync(notice.attachmentPath)) {
      fs.unlinkSync(notice.attachmentPath);
    }

    return res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notice',
      error: error.message
    });
  }
};

// Toggle pin status
const togglePinNotice = async (req, res) => {
  try {
    const { schoolCode, noticeId } = req.params;
    const { pinOrder } = req.body;

    // Verify school exists
    const school = await SchoolAll.findOne({
      where: { code: schoolCode }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const notice = await Notice.findOne({
      where: {
        id: noticeId,
        schoolId: school.id,
        isActive: true
      }
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    const updateData = {
      isPinned: !notice.isPinned,
      pinOrder: !notice.isPinned ? (pinOrder || 1) : null
    };

    await notice.update(updateData);

    return res.status(200).json({
      success: true,
      data: notice,
      message: `Notice ${notice.isPinned ? 'unpinned' : 'pinned'} successfully`
    });
  } catch (error) {
    console.error('Error toggling pin status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle pin status',
      error: error.message
    });
  }
};

// Approve/Reject notice (for approval workflow)
const updateApprovalStatus = async (req, res) => {
  try {
    const { schoolCode, noticeId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;
    const userId = req.user.id;

    // Verify school exists
    const school = await SchoolAll.findOne({
      where: { code: schoolCode }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const notice = await Notice.findOne({
      where: {
        id: noticeId,
        schoolId: school.id,
        isActive: true
      }
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    const updateData = {
      approvalStatus,
      approvedBy: userId,
      approvedAt: new Date()
    };

    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await notice.update(updateData);

    return res.status(200).json({
      success: true,
      data: notice,
      message: `Notice ${approvalStatus} successfully`
    });
  } catch (error) {
    console.error('Error updating approval status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update approval status',
      error: error.message
    });
  }
};

// Get notice statistics
const getNoticeStats = async (req, res) => {
  try {
    const { schoolCode } = req.params;

    // Verify school exists
    const school = await SchoolAll.findOne({
      where: { code: schoolCode }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const stats = await Notice.findAll({
      where: {
        schoolId: school.id,
        isActive: true
      },
      attributes: [
        'noticeType',
        'priority',
        'approvalStatus',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['noticeType', 'priority', 'approvalStatus'],
      raw: true
    });

    const totalNotices = await Notice.count({
      where: {
        schoolId: school.id,
        isActive: true
      }
    });

    const publishedNotices = await Notice.count({
      where: {
        schoolId: school.id,
        isActive: true,
        isPublished: true
      }
    });

    const pinnedNotices = await Notice.count({
      where: {
        schoolId: school.id,
        isActive: true,
        isPinned: true
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalNotices,
        publishedNotices,
        pinnedNotices,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching notice statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notice statistics',
      error: error.message
    });
  }
};

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  togglePinNotice,
  updateApprovalStatus,
  getNoticeStats
};