const { User } = require('../models'); // Assuming you have the User model set up in models

// Function to fetch all users (you can modify this to fetch specific users, based on your needs)
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ // Get all users from the database
      attributes: ['id', 'name', 'email', 'status'], // You can adjust the fields to be returned as needed
    });
    
    // Return the users as JSON response
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUsers };
