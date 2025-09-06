const db = require("../models");
const bcrypt = require("bcrypt");

const AuthUser = db.AuthUser;
const Parent = db.Parent;
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET
  );
};

/**
 * Admin Registration Controller (First admin or superadmin can create this)
 */
////checking ke liye hai
const createSuperAdmin = async (req, res) => {
  try {
    const { username, email, password, fullName, schoolId } = req.body;

    //🔍 Check if superadmin already exists
    const superAdminExists = await AuthUser.findOne({
      where: { role: "superadmin" },
    });

    if (superAdminExists) {
      return res.status(403).json({
        message: "Superadmin already exists. You cannot create again.",
      });
    }

    // ✅ Validate input fields
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create superadmin
    const newSuperAdmin = await AuthUser.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: "superadmin",
      schoolId,
    });

    res.status(201).json({
      message: "Superadmin created successfully",
      user: {
        id: newSuperAdmin.id,
        username: newSuperAdmin.username,
        email: newSuperAdmin.email,
        fullName: newSuperAdmin.fullName,
        role: newSuperAdmin.role,
      },
    });
  } catch (error) {
    console.error("Superadmin creation error:", error);
    res
      .status(500)
      .json({ message: "Server error during superadmin creation" });
  }
};
const createAdminAccount = async (req, res) => {
  const { username, email, password, fullName, schoolId } = req.body;

  try {
    // Check if this is the first admin (no other admins exist)
    const adminExists = await AuthUser.findOne({ where: { role: "admin" } });

    // Only allow if this is first admin or if request comes from an existing admin
    if (adminExists && (!req.user || req.user.role !== "admin")) {
      return res
        .status(403)
        .json({ message: "Unauthorized to create admin account" });
    }

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await AuthUser.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await AuthUser.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: "admin",
      schoolId,
    });

    const userData = {
      id: newAdmin.id,
      username: newAdmin.username,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      role: newAdmin.role,
    };

    res.status(201).json({
      message: "Admin account created successfully",
      user: userData,
    });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Server error during admin registration" });
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
    schoolId,
  } = req.body;

  try {
    // Check if requester is admin
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can register teachers" });
    }

    // Validate required fields
    if (!username || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Username, password, and full name are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await AuthUser.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email: email || null }, { username }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email or username already in use" });
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
      role: "teacher",
    });

    const userData = {
      id: newTeacher.id,
      username: newTeacher.username,
      email: newTeacher.email,
      fullName: newTeacher.fullName,
      userCode: newTeacher.userCode,
      role: newTeacher.role,
      schoolId: newTeacher.schoolId,
    };

    res.status(201).json({
      message: "Teacher account created successfully",
      user: userData,
    });
  } catch (err) {
    console.error("Teacher registration error:", err);
    res
      .status(500)
      .json({ message: "Server error during teacher registration" });
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
    schoolId,
  } = req.body;

  try {
    // Check if requester is admin
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can register students" });
    }

    // Validate required fields
    if (!username || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Username, password, and full name are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await AuthUser.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email: email || null }, { username }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email or username already in use" });
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
      role: "student",
    });

    const userData = {
      id: newStudent.id,
      username: newStudent.username,
      email: newStudent.email,
      fullName: newStudent.fullName,
      userCode: newStudent.userCode,
      role: newStudent.role,
      schoolId: newStudent.schoolId,
    };

    res.status(201).json({
      message: "Student account created successfully",
      user: userData,
    });
  } catch (err) {
    console.error("Student registration error:", err);
    res
      .status(500)
      .json({ message: "Server error during student registration" });
  }
};
//add parent
const addParent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await AuthUser.findOne({ where: { id: studentId } });

    if (!student) {
      return res.status(400).json({
        status: "fail",
        message: "Student does not exist.",
      });
    }

    const {
      firstName,
      middleName,
      lastName,
      relationship,
      email,
      phoneNumber,
    } = req.body;

    const parent = await Parent.create({
      firstName,
      middleName,
      lastName,
      relationship,
      email,
      phoneNumber,
      studentId,
    });

    if (!parent) {
      return res.status(400).json({
        status: "fail",
        message: "Parent info could not be saved",
      });
    }

    return res.status(201).json({
      status: "success",
      data: parent, // returning parent for frontend use
    });
  } catch (err) {
    console.error("Could not add parent:", err);
    res.status(500).json({
      status: "error",
      message: "Server error while adding parent info.",
    });
  }
};
//get parent
const getParentsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const parents = await Parent.findAll({
      where: { studentId },
    });

    if (!parents || parents.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No parents found for this student.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: parents,
    });
  } catch (err) {
    console.error("Could not fetch parents:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error while fetching parent info.",
    });
  }
};
//update parent
const updateParent = async (req, res) => {
  try {
    const { parentId } = req.params;

    const parent = await Parent.findByPk(parentId);
    if (!parent) {
      return res.status(404).json({
        status: "fail",
        message: "Parent not found.",
      });
    }
    const {
      firstName,
      middleName,
      lastName,
      relationship,
      email,
      phoneNumber,
    } = req.body;

    await parent.update({
      firstName,
      middleName,
      lastName,
      relationship,
      email,
      phoneNumber,
    });

    return res.status(200).json({
      status: "success",
      data: parent,
    });
  } catch (err) {
    console.error("Could not update parent:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error while updating parent info.",
    });
  }
};

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await AuthUser.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ username }, { email: username }],
        role: ["admin"], // Only admin roles
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is disabled. Contact an administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const accessToken = generateAccessToken(user);
    console.log("accessToken : ", accessToken);
    await user.update({ lastLogin: new Date() });

    res.status(200).json({
      message: "Admin login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error during admin login" });
  }
};

const loginTeacherOrStudent = async (req, res) => {
  const { username, password, schoolId } = req.body;

  try {
    if (!username || !password || !schoolId) {
      return res
        .status(400)
        .json({ message: "Username, password, and schoolId are required" });
    }

    const user = await AuthUser.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ username }, { email: username }],
        schoolId,
        role: ["teacher", "student"],
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials or school ID" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is disabled. Contact your school admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    await user.update({ lastLogin: new Date() });

    // Get school details
    const school = await db.SchoolAll.findOne({
      where: { id: user.schoolId },
      attributes: [
        "id",
        "code",
        "name",
        "baseUrl",
        "logoPath",
        "bannerPath",
        "paymentLink",
      ],
    });

    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      message: "Login successful",
      user: userData,
      school,
      accessToken,
    });
  } catch (err) {
    console.error("Teacher/Student login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * Logout Controller (client-side token removal)
 */
const handleLogout = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  console.log("hellow i am runing");
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await AuthUser.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "fullName",
        "role",
        "isActive",
        "lastLogin",
        "createdAt",
      ],
    });

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

/**
 * Toggle user active status (admin only)
 */
const toggleUserStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await AuthUser.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent disabling your own admin account
    if (user.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "Cannot modify your own admin status" });
    }

    await user.update({ isActive: !user.isActive });

    res.status(200).json({
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("Error toggling user status:", err);
    res
      .status(500)
      .json({ message: "Server error while updating user status" });
  }
};

module.exports = {
  createAdminAccount,
  registerTeacher,
  registerStudent,
  loginTeacherOrStudent,
  loginAdmin,
  handleLogout,
  getAllUsers,
  toggleUserStatus,
  createSuperAdmin,
  addParent,
  getParentsByStudentId,
  updateParent,
};
