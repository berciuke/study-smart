const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

class UserService {
  async validateUser(token) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/profile`, {
        headers: {
          'Authorization': token
        }
      });
      return response.data;
    } catch (error) {
      console.error('[UserService] validateUser error:', error.response?.data || error.message);
      throw new Error('Błąd weryfikacji użytkownika');
    }
  }

  async getUserById(userId) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('[UserService] getUserById error:', error.response?.data || error.message);
      throw new Error('Błąd pobierania danych użytkownika');
    }
  }
}

module.exports = new UserService(); 