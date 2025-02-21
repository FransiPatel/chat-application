const authController = require('./authController');
const messageController = require('./messageController');
const userController = require('./userController');

module.exports = {
  // Auth Controllers
  register: authController.register,
  login: authController.login,
  logout: authController.logout,

  // Message Controllers
  sendMessage: messageController.sendMessage,
  getChatHistory: messageController.getChatHistory,

  // User Controllers
  getUsers: userController.getUsers,
  getCurrentUser: userController.getCurrentUser
}; 