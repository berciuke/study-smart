const { sequelize } = require('../config/db');
const User = require('../models/user.model');

let createdUserIds = [];

global.trackCreatedUser = (user) => {
  createdUserIds.push(user.id);
};

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  // Usuwam testowe rekordy
  if (createdUserIds.length > 0) {
    await User.destroy({
      where: {
        id: createdUserIds
      }
    });
  }
  await sequelize.close();
}); 