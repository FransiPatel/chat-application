const express = require('express');
const authRoutes = require('./auth');
const messageRoutes = require('./message');
const userRoutes = require('./user');
const auth = require('../middleware/auth');

const router = express.Router();

// Auth routes - /api/auth/*
router.use('/auth', authRoutes);

// Protected routes
// Messages routes - /api/messages/*
router.use('/messages', messageRoutes);

// User routes - /api/users/*
router.use('/users', userRoutes);

// Error handling for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource was not found' 
  });
});

module.exports = router; 