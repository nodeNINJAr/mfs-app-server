const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  type: { type: String, enum: ['sendMoney', 'cashIn', 'cashOut'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);