const express = require('express');
const { getUsers, getCurrentUser } = require('../controllers');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/users', auth, getUsers);
router.get('/me', auth, getCurrentUser);

module.exports = router;
