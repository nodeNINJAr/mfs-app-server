const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  pin: { type: String, required: true },
  nid: { type: String, unique: true, required: true },
  accountType: { type: String, enum: ['user', 'agent',"admin"], required: true },
  balance: { type: Number, default: function () {
    return this.accountType === 'user' ? 40 : 100000;
  }},
  isBlocked: { type: Boolean, default: false },
  isApproved: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: function () {
      return this.accountType === "agent" ? "pending" : null; 
    },
  },
  income: { type: Number, default: 0 }, // For agents
  sessionId: { type: String, default: null }, // Track active session
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);