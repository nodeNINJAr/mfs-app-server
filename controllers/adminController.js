const Transaction = require('../models/Transaction');
const User = require('../models/User');


// ** Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-pin'); // Exclude PIN
    res.status(200).json({ message: 'Users retrieved successfully', users });
  } catch (err) {
    console.error('Error retrieving users:', err);
    res.status(500).json({ message: 'Server error while retrieving users' });
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
  
// ** Search users by phone number
const searchUsers = async (req, res) => {
const { phoneNumber} = req.query;
// 
try {
    const users = await User.find({ mobileNumber: { $regex: phoneNumber, $options: 'i' } }).select('-pin');
    res.status(200).json({ message: 'Users retrieved successfully', users });
} catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: 'Server error while searching users' });
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

module.exports = {
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  getUserTransactions,
  searchUsers,
  getAgentApprovalRequests,
  approveAgent,
  rejectAgent

};