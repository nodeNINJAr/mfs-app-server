const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  getUserTransactions,
  searchUsers,
} = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');

// **
router.use(verifyToken);

// ** Admin routes
router.get('/users', getAllUsers); // Get all users
router.get('/user/:userId', getUserDetails); // Get user details
router.post('/users/:userId/block', blockUser); // Block a user
router.post('/users/:userId/unblock', unblockUser); // Unblock a user
router.get('/users/:userId/transactions', getUserTransactions); // Get user transactions
router.get('/users/search', searchUsers); // Search users by phone number

module.exports = router;