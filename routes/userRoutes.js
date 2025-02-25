const express = require('express');
const { sendMoney, cashOut, cashIn, getBalance, getTransactions } = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.use(verifyToken);


router.post('/sendMoney', sendMoney);


module.exports = router;