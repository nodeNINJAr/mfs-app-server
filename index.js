require('dotenv').config();
const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');
const User = require('./models/User');
const verifyToken = require("./middleware/verifyToken");



// Initialize the Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON


// Middleware
app.use(express.json()); 
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());


// Connect to MongoDB
connectDB();

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/agent', require('./routes/agentRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
// 


app.get("/api/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token." });
  }
});

// Test Route
app.get("/", (req, res) => {
  res.send("MFS API is running...");
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
