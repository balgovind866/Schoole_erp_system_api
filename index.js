const express = require('express');
const app = express();
const authUserRoutes = require('./routes/authUser');

app.use(express.json());

// Connect API route
app.use('/api/users', authUserRoutes);

// Optional: Basic route
app.get('/', (req, res) => {
  res.send('Welcome to School Management API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});