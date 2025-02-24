const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  pin: { type: String, required: true }, 
  role: { type: String, default: "admin" },
  income: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
