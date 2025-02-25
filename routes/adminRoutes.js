const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  getUserTransactions,
  searchUsers,
  getAgentApprovalRequests,
  approveAgent,
  rejectAgent,
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

// ** Agent approval routes
router.get('/agents/approval-requests', getAgentApprovalRequests); // Get all agent approval requests
router.post('/agents/:agentId/approve', approveAgent); // Approve an agent
router.post('/agents/:agentId/reject', rejectAgent); // Reject an agent

module.exports = router;