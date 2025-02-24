require('dotenv').config();
const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;



// Initialize the Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON


// Middleware
app.use(express.json()); 
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());


// Connect to MongoDB
connectDB();







// Test Route
app.get("/", (req, res) => {
  res.send("MFS API is running...");
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
