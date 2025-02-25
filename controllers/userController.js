const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const generateTransactionId = require('../utils/generateTransactionId');
const CashRequest = require('../models/CashRequest');
const WithdrawRequest = require('../models/WithdrawRequest');



// ** send money
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

// ** CashOut
const cashOut = async (req, res) => {
  const { userMobileNumber, agentMobileNumber, amount, pin } = req.body;

  try {
    // ** Validate input data
    if (!userMobileNumber || !agentMobileNumber || !amount || !pin) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // ** Find the user and agent
    const user = await User.findOne({ mobileNumber: userMobileNumber });
    const agent = await User.findOne({ mobileNumber: agentMobileNumber,accountType:'agent' });
    // **
    if (!user || !agent) {
      return res.status(404).json({ message: 'User or agent not found' });
    }

    // Verify the user's PIN
    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    // Validate the amount
    if (amount < 50) {
      return res.status(400).json({ message: 'Minimum amount is 50 Taka' });
    }

    // Calculate the cash-out fee (1.5% of the amount)
    const fee = (amount * 1.5) / 100;
    const totalAmount = amount + fee;

    // Check the user's balance
    if (user.balance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct the amount and fee from the user's balance
    user.balance -= totalAmount;
    await user.save();

    // Add the amount to the agent's balance
    agent.balance += amount;
    await agent.save();

    // Generate a unique transaction ID
    const transactionId = generateTransactionId();

    // Create a new transaction
    const transaction = new Transaction({
      transactionId,
      senderId: user._id,
      receiverId: agent._id,
      amount,
      fee,
      type: 'cashOut',
    });

    await transaction.save();

    // Return success response
    res.status(200).json({
      message: 'Cash-out successful',
      transaction: {
        transactionId: transaction.transactionId,
        userMobileNumber: user.mobileNumber,
        agentMobileNumber: agent.mobileNumber,
        amount: transaction.amount,
        fee: transaction.fee,
        type: transaction.type,
        timestamp: transaction.createdAt,
      },
    });
  } catch (err) {
    console.error('Error during cash-out:', err);
    res.status(500).json({ message: 'Server error during cash-out' });
  }
};

// ** GetTransactions
const getTransactions = async (req, res) => {
  const userId = req.user.id; 
  const { limit = 100, skip = 0 } = req.query;

  try {
    // Find all transactions where the user is either the sender or receiver
    const transactions = await Transaction.find({
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    })
      .sort({ createdAt: -1 }) 
      .limit(parseInt(limit)) 
      .skip(parseInt(skip)) // 
      .populate('senderId', 'name mobileNumber') 
      .populate('receiverId', 'name mobileNumber'); 

    // Formating
    const formattedTransactions = transactions.map((transaction) => ({
      transactionId: transaction.transactionId,
      type: transaction.type,
      amount: transaction.amount,
      fee: transaction.fee,
      sender: {
        name: transaction.senderId.name,
        mobileNumber: transaction.senderId.mobileNumber,
      },
      receiver: {
        name: transaction.receiverId.name,
        mobileNumber: transaction.receiverId.mobileNumber,
      },
      timestamp: transaction.createdAt,
    }));

    res.status(200).json({
      message: 'Transactions retrieved successfully',
      transactions: formattedTransactions,
    });
  } catch (err) {
    console.error('Error retrieving transactions:', err);
    res.status(500).json({ message: 'Server error while retrieving transactions' });
  }
};

// ** Get balanced
const getBalance = async (req, res) => {
  const userId = req.user.id;
  // 
  try {
    // Find the user by ID
    const user = await User.findById(userId).select('balance');
    // 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the balance
    res.status(200).json({
      message: 'Balance retrieved successfully',
      balance: user.balance,
    });
  } catch (err) {
    console.error('Error retrieving balance:', err);
    res.status(500).json({ message: 'Server error while retrieving balance' });
  }
};

// **CashIn By Agent
const cashIn = async (req, res) => {
  const { userMobileNumber, amount, pin } = req.body;
  const verified = req.user;
  
  // 
  try {
    // Validate input data
    if (!userMobileNumber || !amount || !pin) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find the user and agent
    const user = await User.findOne({ mobileNumber: userMobileNumber });
    const agent = await User.findOne({ _id: verified?.id , accountType:verified?.accountType});

    if (!user || !agent) {
      return res.status(404).json({ message: 'User or agent not found' });
    }

    // Verify the agent's PIN
    const isPinValid = await bcrypt.compare(pin, agent.pin);
    if (!isPinValid) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    // Validate the amount
    if (amount < 50) {
      return res.status(400).json({ message: 'Minimum amount is 50 Taka' });
    }

    // Check the agent's balance
    if (agent.balance < amount) {
      return res.status(400).json({ message: 'Agent has insufficient balance' });
    }

    // Deduct the amount from the agent's balance
    agent.balance -= amount;
    await agent.save();

    // Add the amount to the user's balance
    user.balance += amount;
    await user.save();

    // Create a new transaction
    const transaction = new Transaction({
      transactionId:generateTransactionId(),
      senderId: agent._id,
      receiverId: user._id,
      amount,
      fee: 0, 
      type: 'cashIn',
    });

    await transaction.save();

    // **
    res.status(200).json({
      message: 'Cash-in successful',
      transaction: {
        transactionId: transaction.transactionId,
        userMobileNumber: user.mobileNumber,
        agentMobileNumber: agent.mobileNumber,
        amount: transaction.amount,
        fee: transaction.fee,
        type: transaction.type,
        timestamp: transaction.createdAt,
      },
    });
  } catch (err) {
    console.error('Error during cash-in:', err);
    res.status(500).json({ message: 'Server error during cash-in' });
  }
};

// ** Request cash recharge
const requestCashRecharge = async (req, res) => {
  const { amount } = req.body;
  const agentId = req.user.id;

  try {
    // Create a new cash request
    const cashRequest = new CashRequest({
      agentId,
      amount,
      status: 'pending',
    });

    await cashRequest.save();

    res.status(201).json({ message: 'Cash request submitted successfully', cashRequest });
  } catch (err) {
    console.error('Error submitting cash request:', err);
    res.status(500).json({ message: 'Server error while submitting cash request' });
  }
};

// ** Request withdrawal
const requestWithdraw = async (req, res) => {
  const { amount } = req.body;
  const agentId = req.user.id; 

  try {
    // Create a new withdraw request
    const withdrawRequest = new WithdrawRequest({
      agentId,
      amount,
      status: 'pending',
    });

    await withdrawRequest.save();

    res.status(201).json({ message: 'Withdraw request submitted successfully', withdrawRequest });
  } catch (err) {
    console.error('Error submitting withdraw request:', err);
    res.status(500).json({ message: 'Server error while submitting withdraw request' });
  }
};


module.exports = { sendMoney, cashOut, cashIn, getTransactions, getBalance , requestCashRecharge, requestWithdraw};