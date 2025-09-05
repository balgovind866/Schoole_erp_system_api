require('dotenv').config();
const express = require('express');

const { sequelize } = require('./models');
const cors = require("cors");
const schoolRoutes = require('./routes/schools_rout');
const authRoutes = require('./routes/authUser');
const noticeRoutes=require('./routes/notices');
const subjectRoutes=require('./routes/subject');
const teacherRoutes=require('./routes/teacher');
const sessionRoutes=require('./routes/session_route');
const classRoutes=require('./routes/class_route');
const sectionRoutes=require('./routes/section_route');
const studentEnrollmentRoutes=require('./routes/studentEnrollment_route');


const app = express();

app.use(cors());
app.use(express.json());

//app.use('/schoole', schoolRoutes);
app.use('/api/schoole', schoolRoutes);
app.use('/auth', authRoutes);
app.use('/api',noticeRoutes);
app.use('/api/sub',subjectRoutes);
app.use('/api/teacher',teacherRoutes);
// session route 
app.use('/api/session',sessionRoutes);
// class  route 
app.use('/api/class',classRoutes);
// section  route 
app.use('/api/section',sectionRoutes);
// studentEnrollment  route 
app.use('/api/studentEnrollment',studentEnrollmentRoutes);
// Start server only after DB connection
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });