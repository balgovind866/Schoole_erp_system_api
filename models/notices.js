module.exports = (sequelize, DataTypes) => {
  const Notice = sequelize.define('Notice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    noticeType: {
      type: DataTypes.ENUM(
        'general', 
        'urgent', 
        'event', 
        'exam', 
        'holiday', 
        'academic', 
        'administrative',
        'circular'
      ),
      defaultValue: 'general'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    targetAudience: {
      type: DataTypes.ENUM(
        'all', 
        'students', 
        'teachers', 
        'parents', 
        'staff', 
        'admin',
        'specific_class',
        'specific_section'
      ),
      defaultValue: 'all'
    },
    // For specific class/section targeting
    targetClassId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Used when targetAudience is specific_class'
    },
    targetSectionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Used when targetAudience is specific_section'
    },
    // School association
    schoolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'school_alls',
        key: 'id'
      }
    },
    // Session association
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Optional: Link notice to specific academic session'
    },
    // Author information
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'auth_users',
        key: 'id'
      }
    },
    // Attachment support
    attachmentPath: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Path to attached file (PDF, image, etc.)'
    },
    attachmentName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Original name of attached file'
    },
    // Publishing control
    publishDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: 'When the notice should be published'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the notice expires and becomes inactive'
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the notice is currently published'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Read tracking
    totalViews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total number of times notice was viewed'
    },
    // Pinning functionality
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Pinned notices appear at top'
    },
    pinOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Order of pinned notices (lower number = higher priority)'
    },
    // Approval workflow (optional)
    approvalStatus: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected'),
      defaultValue: 'approved',
      comment: 'For notices requiring approval'
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'auth_users',
        key: 'id'
      },
      comment: 'ID of user who approved the notice'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Metadata
    tags: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Comma-separated tags for categorization'
    },
    noticeNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'Official notice number (auto-generated or manual)'
    }
  }, {
    tableName: 'notices',
    timestamps: true,
    indexes: [
      {
        fields: ['schoolId', 'isPublished', 'isActive']
      },
      {
        fields: ['targetAudience']
      },
      {
        fields: ['noticeType']
      },
      {
        fields: ['publishDate']
      },
      {
        fields: ['isPinned', 'pinOrder']
      },
      {
        fields: ['expiryDate']
      }
    ],
    scopes: {
      // Published and active notices only
      published: {
        where: {
          isPublished: true,
          isActive: true,
          [sequelize.Sequelize.Op.or]: [
            { publishDate: null },
            { publishDate: { [sequelize.Sequelize.Op.lte]: new Date() } }
          ],
          [sequelize.Sequelize.Op.or]: [
            { expiryDate: null },
            { expiryDate: { [sequelize.Sequelize.Op.gte]: new Date() } }
          ]
        }
      },
      // Pinned notices
      pinned: {
        where: { isPinned: true },
        order: [['pinOrder', 'ASC'], ['createdAt', 'DESC']]
      },
      // Recent notices
      recent: {
        order: [['createdAt', 'DESC']],
        limit: 10
      }
    },
    // Hooks for auto-generating notice numbers
    hooks: {
      beforeCreate: async (notice, options) => {
        if (!notice.noticeNumber) {
          const year = new Date().getFullYear();
          const count = await Notice.count({
            where: {
              schoolId: notice.schoolId,
              createdAt: {
                [sequelize.Sequelize.Op.gte]: new Date(year, 0, 1),
                [sequelize.Sequelize.Op.lt]: new Date(year + 1, 0, 1)
              }
            }
          });
          notice.noticeNumber = `NT-${year}-${String(count + 1).padStart(4, '0')}`;
        }
      }
    }
  });

  // Define associations
  Notice.associate = (models) => {
    // Association with school
    Notice.belongsTo(models.SchoolAll, {
      foreignKey: 'schoolId',
      as: 'school'
    });

    // Association with author (user who created the notice)
    Notice.belongsTo(models.AuthUser, {
      foreignKey: 'authorId',
      as: 'author'
    });

    // Association with approver
    Notice.belongsTo(models.AuthUser, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });

    // Association with session (if available)
    if (models.Session) {
      Notice.belongsTo(models.Session, {
        foreignKey: 'sessionId',
        as: 'session'
      });
    }

    // Association with class (if you have Class model)
    if (models.Class) {
      Notice.belongsTo(models.Class, {
        foreignKey: 'targetClassId',
        as: 'targetClass'
      });
    }

    // Association with section
    if (models.Section) {
      Notice.belongsTo(models.Section, {
        foreignKey: 'targetSectionId',
        as: 'targetSection'
      });
    }

    // Association with notice reads (for tracking who read what)
    if (models.NoticeRead) {
      Notice.hasMany(models.NoticeRead, {
        foreignKey: 'noticeId',
        as: 'reads'
      });
    }
  };

  return Notice;
};