const db = require('../models');
const bcrypt = require('bcrypt');

const AuthUser = db.AuthUser;
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      username: user.username,
      role: user.role 
    }, 
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Admin Registration Controller (First admin or superadmin can create this)
 */
const createAdminAccount = async (req, res) => {
  const { username, email, password, fullName } = req.body;
  
  try {
    // Check if this is the first admin (no other admins exist)
    const adminExists = await AuthUser.findOne({ where: { role: 'admin' } });
    
    // Only allow if this is first admin or if request comes from an existing admin
    if (adminExists && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Unauthorized to create admin account' });
    }
    
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    const existingUser = await AuthUser.findOne({ 
      where: {
        [db.Sequelize.Op.or]: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await AuthUser.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'admin'
    });
    
    const userData = {
      id: newAdmin.id,
      username: newAdmin.username,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      role: newAdmin.role
    };
    
    res.status(201).json({
      message: 'Admin account created successfully',
      user: userData
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ message: 'Server error during admin registration' });
  }
};

/**
 * Teacher Registration Controller (Admin only)
 */
const registerTeacher = async (req, res) => {
  const { 
    username, 
    email, 
    password, 
    fullName,
    userCode,
    address,
    joinDate,
    dob,
    mobileNumber,
    gender,
    maritalStatus,
    qualification,
    imgPath,
    aadhar,
    classInCharge,
    sectionId,
    appQrAutoAccept,
    schoolId
  } = req.body;
  
  try {
    // Check if requester is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can register teachers' });
    }
    
    // Validate required fields
    if (!username || !password || !fullName) {
      return res.status(400).json({ message: 'Username, password, and full name are required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    const existingUser = await AuthUser.findOne({ 
      where: {
        [db.Sequelize.Op.or]: [
          { email: email || null },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newTeacher = await AuthUser.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      userCode,
      address,
      joinDate: joinDate ? new Date(joinDate) : null,
      dob: dob ? new Date(dob) : null,
      mobileNumber,
      gender,
      maritalStatus,
      qualification,
      imgPath,
      aadhar,
      classInCharge,
      sectionId,
      appQrAutoAccept: appQrAutoAccept || false,
      schoolId,
      role: 'teacher'
    });
    
    const userData = {
      id: newTeacher.id,
      username: newTeacher.username,
      email: newTeacher.email,
      fullName: newTeacher.fullName,
      userCode: newTeacher.userCode,
      role: newTeacher.role,
      schoolId: newTeacher.schoolId
    };
    
    res.status(201).json({
      message: 'Teacher account created successfully',
      user: userData
    });
  } catch (err) {
    console.error('Teacher registration error:', err);
    res.status(500).json({ message: 'Server error during teacher registration' });
  }
};

/**
 * Student Registration Controller (Admin only)
 */
const registerStudent = async (req, res) => {
  const { 
    username, 
    email, 
    password, 
    fullName,
    userCode,
    address,
    joinDate,
    dob,
    mobileNumber,
    gender,
    qualification,
    imgPath,
    aadhar,
    sectionId,
    appQrAutoAccept,
    schoolId
  } = req.body;
  
  try {
    // Check if requester is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can register students' });
    }
    
    // Validate required fields
    if (!username || !password || !fullName) {
      return res.status(400).json({ message: 'Username, password, and full name are required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    const existingUser = await AuthUser.findOne({ 
      where: {
        [db.Sequelize.Op.or]: [
          { email: email || null },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newStudent = await AuthUser.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      userCode,
      address,
      joinDate: joinDate ? new Date(joinDate) : null,
      dob: dob ? new Date(dob) : null,
      mobileNumber,
      gender,
      qualification,
      imgPath,
      aadhar,
      sectionId,
      appQrAutoAccept: appQrAutoAccept || false,
      schoolId,
      role: 'student'
    });
    
    const userData = {
      id: newStudent.id,
      username: newStudent.username,
      email: newStudent.email,
      fullName: newStudent.fullName,
      userCode: newStudent.userCode,
      role: newStudent.role,
      schoolId: newStudent.schoolId
    };
    
    res.status(201).json({
      message: 'Student account created successfully',
      user: userData
    });
  } catch (err) {
    console.error('Student registration error:', err);
    res.status(500).json({ message: 'Server error during student registration' });
  }
};
/**
 * Login Controller
 */
const handleUserLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await AuthUser.findOne({ 
      where: { 
        [db.Sequelize.Op.or]: [
          { username },
          { email: username } // Allow login with email or username
        ]
      } 
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is disabled. Please contact an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    
    // Update last login timestamp
    await user.update({ lastLogin: new Date() });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      accessToken
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Logout Controller (client-side token removal)
 */
const handleLogout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  console.log('hellow i am runing');
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const users = await AuthUser.findAll({
      attributes: ['id', 'username', 'email', 'fullName', 'role', 'isActive', 'lastLogin', 'createdAt']
    });
    
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

/**
 * Toggle user active status (admin only)
 */
const toggleUserStatus = async (req, res) => {
  const { userId } = req.params;
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const user = await AuthUser.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent disabling your own admin account
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot modify your own admin status' });
    }
    
    await user.update({ isActive: !user.isActive });
    
    res.status(200).json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
};

module.exports = {
  createAdminAccount,
  registerTeacher,
  registerStudent,
  handleUserLogin,
  handleLogout,
  getAllUsers,
  toggleUserStatus
};