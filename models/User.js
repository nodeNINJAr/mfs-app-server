const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  pin: { type: String, required: true },
  nid: { type: String, unique: true, required: true },
  accountType: { type: String, enum: ['user', 'agent'], required: true },
  balance: { type: Number, default: function () {
    return this.accountType === 'user' ? 40 : 100000;
  }},
  isBlocked: { type: Boolean, default: false },
  isApproved: { type: String, default: 'pending' }, // For agents
  income: { type: Number, default: 0 }, // For agents
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);