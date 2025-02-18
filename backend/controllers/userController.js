const { User } = require('../models'); // Assuming you have the User model set up in models
const { Op } = require('sequelize');

// Function to fetch all users (you can modify this to fetch specific users, based on your needs)
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
      where: {
        id: { [Op.ne]: req.user.id }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email']
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching current user" });
  }
};

module.exports = { getUsers, getCurrentUser };
