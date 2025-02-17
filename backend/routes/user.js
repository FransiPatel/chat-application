const express = require('express');
const { getUsers } = require('../controllers/userController'); // Add this line to import the controller function
const router = express.Router();

// New route to fetch users
router.get('/users', getUsers); // This will fetch all users

module.exports = router;
