const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  blockUser,
  getUserTransactions,
  getAgentApprovalRequests,
  approveAgent,
  rejectAgent,
  getCashRequests,
  approveCashRequest,
  getWithdrawRequests,
  approveWithdrawRequest,
  calculateSystemMoney
} = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');

// **
router.use(verifyToken);

// ** Admin routes
router.get('/users', getAllUsers); // Get all users
router.get('/user/:userId', getUserDetails); // Get user details
router.patch('/users/:userId/block', blockUser); // Block and unblock user
router.get('/users/:userId/transactions', getUserTransactions); // Get user transactions


// ** Admin approval routes for agent req
router.get('/agents/approval-requests', getAgentApprovalRequests); // Get all agent approval requests
router.patch('/agents/:agentId/approve', approveAgent); // Approve an agent
router.patch('/agents/:agentId/reject', rejectAgent); // Reject an agent
// ** System money
router.get('/system-money', calculateSystemMoney)

// ** Admin routes for cash and withdraw requests
router.get('/cash-requests', getCashRequests); // Get all cash requests
router.post('/cash-requests/:requestId/approve', approveCashRequest); // Approve cash request
router.get('/withdraw-requests', getWithdrawRequests); // Get all withdraw requests
router.post('/withdraw-requests/:requestId/approve', approveWithdrawRequest); // Approve withdraw request

module.exports = router;