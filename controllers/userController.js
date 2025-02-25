const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Transaction = require('../models/Transaction');
const generateTransactionId = require('../utils/generateTransactionId');


const sendMoney = async (req, res) => {
  const { receiverMobileNumber, amount, pin } = req.body;
  const validInfo = req.user;
  // Find sender
  const sender = await User.findOne({_id : validInfo?.id});
  // Validate PIN
  const isPinValid = await bcrypt.compare(pin, sender.pin);
  if (!isPinValid) return res.status(400).json({ message: 'Invalid PIN' });

  // Validate receiver
  const receiver = await User.findOne({ mobileNumber: receiverMobileNumber });
  if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

  // Validate amount
  if (amount < 50) return res.status(400).json({ message: 'Minimum amount is 50 Taka' });

  // Calculate fee
  const fee = amount > 100 ? 5 : 0;
  const totalAmount = amount + fee;

  // Check sender balance
  if (sender.balance < totalAmount) return res.status(400).json({ message: 'Insufficient balance' });

  // ** Update balances
  sender.balance -= totalAmount;
  receiver.balance += amount;

  // Create transaction
  const transaction = new Transaction({
    transactionId: generateTransactionId(),
    senderId: sender._id,
    receiverId: receiver._id,
    amount,
    fee,
    type: 'sendMoney',
  });

  await Promise.all([sender.save(), receiver.save(), transaction.save()]);
  res.status(200).json({ message: 'Transaction successful', transaction });
};

module.exports = { sendMoney };