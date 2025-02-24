const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  isApproved: { type: Boolean, default: false }, // For agents
  income: { type: Number, default: 0 }, // For agents
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);