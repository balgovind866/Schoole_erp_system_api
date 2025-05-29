require('dotenv').config();
const express = require('express');

const { sequelize } = require('./models');
const cors = require("cors");
const schoolRoutes = require('./routes/schools_rout');
const authRoutes = require('./routes/authUser');
const app = express();

app.use(cors());
app.use(express.json());

//app.use('/schoole', schoolRoutes);
app.use('/api/schoole', schoolRoutes);
app.use('/auth', authRoutes);

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