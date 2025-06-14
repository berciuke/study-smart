const axios = require('axios');

class UserService {
  constructor() {
    this.baseURL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
  }

  async getUser(token) {
    try {
      const response = await axios.get(`${this.baseURL}/api/users/profile`, {
        headers: { Authorization: token }
      });
      return response.data;
    } catch (error) {
      throw new Error(`User service error: ${error.message}`);
    }
  }

  async validateInstructor(token) {
    const user = await this.getUser(token);
    if (!['instruktor', 'administrator'].includes(user.role)) {
      throw new Error('Brak uprawnień instruktora');
    }
    return user;
  }

  async validateUser(token) {
    return await this.getUser(token);
  }

  async getUserById(userId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`User service error: ${error.message}`);
    }
  }
}

module.exports = new UserService(); 