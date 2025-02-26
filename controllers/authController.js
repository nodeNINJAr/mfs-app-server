const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');



// ** Register The User
const registerUser = async (req, res) => {
    const { name, mobileNumber, email, pin, nid, accountType } = req.body;
  
    try {
      // Validate input data
      if (!name || !mobileNumber || !email || !pin || !nid || !accountType) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Check if mobileNumber, email, or NID already exists
      const filter = {
        $or: [
          { mobileNumber: mobileNumber },
          { email: email },
          { nid: nid },
        ],
      };
  
      const existingUser = await User.findOne(filter);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with the same mobile number, email, or NID' });
      }
  
      // Hash the PIN
      const hashedPin = await bcrypt.hash(pin.toString(), 10);
  
      // Set default values based on accountType in paisa
      const balance = accountType === 'user' ? parseInt(4000) : parseInt(10000000) ;
  
      // Create a new user
      const newUser = new User({
        name,
        mobileNumber,
        email,
        pin: hashedPin,
        nid,
        accountType,
        balance,
        isBlocked: false, // Default value
        income: 0,        // Default value for agents
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Return success response
      // const userResponse = {
      //   _id: newUser._id,
      //   name: newUser.name,
      //   mobileNumber: newUser.mobileNumber,
      //   email: newUser.email,
      //   accountType: newUser.accountType,
      //   balance: newUser.balance,
      //   isApproved: newUser.isApproved,
      // };
  
      res.status(201).json({ message: 'User registered successfully'});
    } catch (err) {
      console.error('Error during registration:', err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  };

  

// ** User Login
  const login = async (req, res) => {
    const { userName, pin } = req.body;
    // 
    try {
      // Validate input data
      if (!userName || !pin) {
        return res.status(400).json({ message: 'Mobile number/email and PIN are required' });
      }
  
      // Find the user by mobileNumber or email
      const user = await User.findOne({
        $or: [
          { mobileNumber: userName },
          { email: userName },
        ],
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

       // Check if the user is already logged in (only for users and agents)
        if (user.sessionId && (user.accountType === "user" || user.accountType === "agent")) {
          return res.status(400).json({ message: "User is already logged in from another device" });
        }
      // pin validate 
        const isPinValid = await bcrypt.compare(pin.toString(), user.pin);
      //  
        if (!isPinValid) {
          return res.status(401).json({ message: 'Invalid PIN' });
        }

        
        // Generate a new session ID
         const sessionId = uuidv4();
          // Update the user's session ID
          user.sessionId = sessionId;
          await user.save();


        // Generate token and continue with successful login...
        const token = jwt.sign(
          { id: user._id, sessionId, accountType: user.accountType },
          process.env.JWT_SECRET,
          { expiresIn: '2h' }
        );
         
         // Set the token in a cookie
        res.cookie('token', token, {
            // httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'strict', 
        });

        // 
        const userResponse = {
          _id: user._id,
           name: user.name,
          accountType: user.accountType,
          balance: user.balance,
          isApproved: user.isApproved,
        };

        res.status(200).json({ message: 'Login successful',token,user:userResponse });
   
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ message: 'Server error during login'});
    }
};

// ** LogOut
const logout = async(req, res) => {
const {userId} = req?.body;
    try {
     // Clear the session ID
     const user = await User.findOne({_id:userId});
      user.sessionId = null;
      await user.save();
      // Clear the token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
  
      res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ message: 'Server error during logout' });
    }
  };
  


module.exports = { registerUser, login, logout};