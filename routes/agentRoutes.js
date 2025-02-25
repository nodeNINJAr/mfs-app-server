const express = require('express');
const { cashIn, getBalance,getTransactions } = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.use(verifyToken);

// 
router.post('/cashIn', cashIn);
// router.get('/balance', getBalance);
router.get('/transactions', getTransactions);

module.exports = router;