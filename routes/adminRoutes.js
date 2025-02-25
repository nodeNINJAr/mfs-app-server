const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
} = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');

// **
router.use(verifyToken);

// ** Admin routes
router.get('/users', getAllUsers); // Get all users
router.get('/users/:userId', getUserDetails); // Get user details
router.post('/users/:userId/block', blockUser); // Block a user
router.post('/users/:userId/unblock', unblockUser); // Unblock a user


module.exports = router;