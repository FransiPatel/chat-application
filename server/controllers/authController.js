const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Validator = require('validatorjs');
const { User } = require("../models");
const redisClient = require("../config/redis");
const { AUTH, REDIS_KEYS } = require("../config/constants");

// Register validation rules
const registerRules = {
  name: 'required|string|min:2|max:50',
  email: 'required|email',
  password: [
    "required",
    "string",
    "min:6",
    "regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$/"
  ],
};

// Login validation rules
const loginRules = {
  email: 'required|email',
  password: 'required|string'
};

// Register a new user
const register = async (req, res) => {
  try {
    const validation = new Validator(req.body, registerRules);
    
    if (validation.fails()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.errors.all() 
      });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// User Login
const login = async (req, res) => {
  try {
    const validation = new Validator(req.body, loginRules);
    
    if (validation.fails()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.errors.all() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: AUTH.TOKEN_EXPIRY }
    );

    // Send response
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// User Logout
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove the token from Redis
    await redisClient.del(REDIS_KEYS.USER_TOKEN.replace('{userId}', userId));

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, logout };
