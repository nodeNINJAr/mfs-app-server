const express = require('express');
const { sendMoney, cashOut, getTransactions, getBalance } = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.use(verifyToken);


router.get('/balance', getBalance);
router.post('/sendMoney', sendMoney);
router.post('/cashOut', cashOut);
router.get('/transactions', getTransactions);

module.exports = router;