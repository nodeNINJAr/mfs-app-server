const Transaction = require('../models/Transaction');
const User = require('../models/User');
const CashRequest = require('../models/CashRequest');
const WithdrawRequest = require('../models/WithdrawRequest');


// ** Get all users with optional search by mobile number
const getAllUsers = async (req, res) => {
  try {
    const { mobileNumber } = req.query;
    
    // Build the query
    const query = {};
    if (mobileNumber) {
      query.mobileNumber = { $regex: mobileNumber, $options: "i" };
    }

    // Fetch users based on the query
    const users = await User.find(query).select("-pin"); // Exclude PIN
    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({ message: "Server error while retrieving users" });
  }
};

// ** Get user details
const getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('-pin'); // Exclude PIN
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User details retrieved successfully', user });
  } catch (err) {
    console.error('Error retrieving user details:', err);
    res.status(500).json({ message: 'Server error while retrieving user details' });
  }
};

// ** Block a user
const blockUser = async (req, res) => {
    const { userId } = req.params;
    // 
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.isBlocked = true;
      await user.save();
  
      res.status(200).json({ message: 'User blocked successfully', user });
    } catch (err) {
      console.error('Error blocking user:', err);
      res.status(500).json({ message: 'Server error while blocking user' });
    }
  };
  
// ** Unblock a user
const unblockUser = async (req, res) => {
const { userId } = req.params;
// 
try {
    const user = await User.findById(userId);
    if (!user) {
    return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({ message: 'User unblocked successfully', user });
} catch (err) {
    console.error('Error unblocking user:', err);
    res.status(500).json({ message: 'Server error while unblocking user' });
}
};

// ** Get all transactions for a user
const getUserTransactions = async (req, res) => {
    const { userId } = req.params;
    // 
    try {
      const transactions = await Transaction.find({
        $or: [
          { senderId: userId },
          { receiverId: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .populate('senderId', 'name mobileNumber') 
        .populate('receiverId', 'name mobileNumber');
  
      res.status(200).json({
        message: 'User transactions retrieved successfully',
        transactions,
      });
    } catch (err) {
      console.error('Error retrieving user transactions:', err);
      res.status(500).json({ message: 'Server error while retrieving user transactions' });
    }
  };
  

// ** Get all agent approval requests
const getAgentApprovalRequests = async (req, res) => {
  try {
    // Find all agents with isApproved = false
    const agents = await User.find({ accountType: 'agent', isApproved: "pending",isApproved: "rejected", }).select('-pin'); 

    res.status(200).json({ message: 'Agent approval requests retrieved successfully', agents });
  } catch (err) {
    console.error('Error retrieving agent approval requests:', err);
    res.status(500).json({ message: 'Server error while retrieving agent approval requests' });
  }
};

// ** Approve an agent
const approveAgent = async (req, res) => {
  const { agentId } = req.params;

  try {
    const agent = await User.findById(agentId);
    if (!agent || agent.accountType !== 'agent') {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.isApproved = "approved";
    await agent.save();

    res.status(200).json({ message: 'Agent approved successfully', agent });
  } catch (err) {
    console.error('Error approving agent:', err);
    res.status(500).json({ message: 'Server error while approving agent' });
  }
};

// ** Reject an agent
const rejectAgent = async (req, res) => {
  const { agentId } = req.params;
  //   
  try {
    const agent = await User.findById(agentId);
    if (!agent || agent.accountType !== 'agent') {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // mark them as rejected
    agent.isApproved = 'rejected';
    await agent.save();

    res.status(200).json({ message: 'Agent rejected successfully', agent });
  } catch (err) {
    console.error('Error rejecting agent:', err);
    res.status(500).json({ message: 'Server error while rejecting agent' });
  }
};


// ** Get all cash requests
const getCashRequests = async (req, res) => {
  try {
    const cashRequests = await CashRequest.find({ status: 'pending' }).populate('agentId', 'name mobileNumber');
    res.status(200).json({ message: 'Cash requests retrieved successfully', cashRequests });
  } catch (err) {
    console.error('Error retrieving cash requests:', err);
    res.status(500).json({ message: 'Server error while retrieving cash requests' });
  }
};

// ** Approve cash request
const approveCashRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const cashRequest = await CashRequest.findById(requestId).populate('agentId');
    if (!cashRequest) {
      return res.status(404).json({ message: 'Cash request not found' });
    }

    // Add 100,000 to the agent's balance
    cashRequest.agentId.balance += 100000;
    await cashRequest.agentId.save();

    // Update the cash request status
    cashRequest.status = 'approved';
    await cashRequest.save();

    res.status(200).json({ message: 'Cash request approved successfully', cashRequest });
  } catch (err) {
    console.error('Error approving cash request:', err);
    res.status(500).json({ message: 'Server error while approving cash request' });
  }
};

// ** Get all withdraw requests
const getWithdrawRequests = async (req, res) => {
  try {
    const withdrawRequests = await WithdrawRequest.find({ status: 'pending' }).populate('agentId', 'name mobileNumber');
    res.status(200).json({ message: 'Withdraw requests retrieved successfully', withdrawRequests });
  } catch (err) {
    console.error('Error retrieving withdraw requests:', err);
    res.status(500).json({ message: 'Server error while retrieving withdraw requests' });
  }
};

// ** Approve withdraw request
const approveWithdrawRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const withdrawRequest = await WithdrawRequest.findById(requestId).populate('agentId');
    if (!withdrawRequest) {
      return res.status(404).json({ message: 'Withdraw request not found' });
    }

    // Update the agent's income
    withdrawRequest.agentId.income -= withdrawRequest.amount;
    await withdrawRequest.agentId.save();

    // Update the withdraw request status
    withdrawRequest.status = 'approved';
    await withdrawRequest.save();

    res.status(200).json({ message: 'Withdraw request approved successfully', withdrawRequest });
  } catch (err) {
    console.error('Error approving withdraw request:', err);
    res.status(500).json({ message: 'Server error while approving withdraw request' });
  }
};





module.exports = {
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  getUserTransactions,
  searchUsers,
  getAgentApprovalRequests,
  approveAgent,
  rejectAgent,
  getCashRequests,
  approveCashRequest,
  getWithdrawRequests,
  approveWithdrawRequest,

};