const { prisma } = require('../config/db');

let createdUserIds = [];

global.trackCreatedUser = (user) => {
  createdUserIds.push(user.id);
};

beforeAll(async () => {
  // Ensure database connection is established
  try {
    await prisma.$connect();
    console.log('✅ Połączono z bazą danych (testy)');
  } catch (error) {
    console.error('❌ Błąd połączenia z bazą danych:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Usuwam testowe rekordy
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUserIds
          }
        }
      });
      console.log(`🧹 Usunięto ${createdUserIds.length} testowych użytkowników`);
    }
  } catch (error) {
    console.error('❌ Błąd czyszczenia testów:', error);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Rozłączono z bazą danych (testy)');
  }
}); 