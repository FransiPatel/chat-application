const { User } = require('../models'); // Assuming you have the User model set up in models
const { Op } = require('sequelize');
const Validator = require('validatorjs');

// Search validation rules
const searchRules = {
  search: 'string|max:50'
};

// Function to fetch all users 
const getUsers = async (req, res) => {
  try {
    const validation = new Validator(req.query, searchRules);
    
    if (validation.fails()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.errors.all() 
      });
    }

    const { search } = req.query;
    const currentUserId = req.user.id;

    let whereClause = {
      id: { [Op.ne]: currentUserId } // Exclude current user
    };

    // Add search condition if search query exists
    if (search && search.trim()) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.iLike]: `%${search.trim()}%` } },
          { email: { [Op.iLike]: `%${search.trim()}%` } }
        ]
      };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ 
      message: "Error fetching users",
      error: error.message 
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email']
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: "User not found"
      });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching current user" });
  }
};

module.exports = { getUsers, getCurrentUser };
