const mongoose = require("mongoose");
const mongodb = process.env.MONGO_URI


// **
const connectDB = async () => {
  try {
    await mongoose.connect(mongodb);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
