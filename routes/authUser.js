const express = require('express');
const router = express.Router();
const { AuthUser } = require('../models');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await AuthUser.findAll({
      attributes: { exclude: ['password'] }, // exclude password
      include: ['school', 'section'] // if associations exist and are needed
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;