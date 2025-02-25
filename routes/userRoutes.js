const express = require('express');
const { sendMoney, cashOut } = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.use(verifyToken);


router.post('/sendMoney', sendMoney);
router.post('/cashOut', cashOut);

// router.get('/transactions', getTransactions);

module.exports = router;