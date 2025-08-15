const express = require("express");
const router = express.Router();
const controller = require("../controllers/notic_controller");
const { verifyToken, isAdmin, isActiveUser, isTeacher } = require('../middleware/authentication');
const upload = require('../middleware/file_uploade'); // Assuming you have file upload middleware

// Public routes (no authentication required)
// Get all published notices for a school
router.get('/:schoolCode/notices', controller.getNotices);

// Get a specific published notice
router.get('/:schoolCode/notices/:noticeId', controller.getNoticeById);

// Protected routes (authentication required)
router.use(verifyToken);
router.use(isActiveUser);

// Routes for teachers and admins (can create notices)
router.post('/:schoolCode/notices', 
  isTeacher,  // Teachers and above can create notices
  upload.single('attachment'), // Handle file upload
  controller.createNotice
);

// Update notice (author or admin only)
router.put('/:schoolCode/notices/:noticeId',
  upload.single('attachment'),
  controller.updateNotice
);

// Delete notice (author or admin only)
router.delete('/:schoolCode/notices/:noticeId', controller.deleteNotice);

// Admin only routes
// Toggle pin status (admin only)
router.patch('/:schoolCode/notices/:noticeId/pin', 
  isAdmin, 
  controller.togglePinNotice
);

// Approve/Reject notice (admin only)
router.patch('/:schoolCode/notices/:noticeId/approval', 
  isAdmin, 
  controller.updateApprovalStatus
);

// Get notice statistics (admin only)
router.get('/:schoolCode/notices-stats', 
  isAdmin, 
  controller.getNoticeStats
);

module.exports = router;