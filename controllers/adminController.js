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



module.exports = {
  getAllUsers,
  getUserDetails
};