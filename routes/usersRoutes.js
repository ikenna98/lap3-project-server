const express = require('express');
const router = express.Router();
const { index, addUserScore } = require('../controllers/user');

router.get('/', index);
router.post('/', addUserScore);

module.exports = router;
