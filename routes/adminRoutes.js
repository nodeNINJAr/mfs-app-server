const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
} = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');

// **
router.use(verifyToken);

// ** Admin routes
router.get('/users', getAllUsers); // Get all users
router.get('/users/:userId', getUserDetails); // Get user details


module.exports = router;