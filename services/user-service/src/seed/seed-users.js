const { prisma } = require('../config/db');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    console.log('🌱 Rozpoczynam seedowanie użytkowników...');

    // Sprawdzam czy już istnieją użytkownicy
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log(`ℹ️ Znaleziono ${existingUsers} użytkowników. Pomijam seedowanie.`);
      return;
    }

    // Tworzę podstawowych użytkowników
    const users = [
      {
        email: 'admin@study-smart.pl',
        password: 'AdminPass123!',
        firstName: 'Administrator',
        lastName: 'System',
        role: 'administrator',
        preferredLanguage: 'pl'
      },
      {
        email: 'instruktor@study-smart.pl',
        password: 'InstruktorPass123!',
        firstName: 'Jan',
        lastName: 'Kowalski',
        role: 'instruktor',
        preferredLanguage: 'pl'
      },
      {
        email: 'mentor@study-smart.pl',
        password: 'MentorPass123!',
        firstName: 'Anna',
        lastName: 'Nowak',
        role: 'mentor',
        preferredLanguage: 'pl'
      },
      {
        email: 'student1@study-smart.pl',
        password: 'StudentPass123!',
        firstName: 'Piotr',
        lastName: 'Wiśniewski',
        role: 'student',
        preferredLanguage: 'pl'
      },
      {
        email: 'student2@study-smart.pl',
        password: 'StudentPass123!',
        firstName: 'Maria',
        lastName: 'Dąbrowska',
        role: 'student',
        preferredLanguage: 'en'
      },
      {
        email: 'student3@study-smart.pl',
        password: 'StudentPass123!',
        firstName: 'Tomasz',
        lastName: 'Lewandowski',
        role: 'student',
        preferredLanguage: 'pl'
      },
      {
        email: 'instruktor2@study-smart.pl',
        password: 'InstruktorPass123!',
        firstName: 'Magdalena',
        lastName: 'Zielińska',
        role: 'instruktor',
        preferredLanguage: 'en'
      },
      {
        email: 'student4@study-smart.pl',
        password: 'StudentPass123!',
        firstName: 'Michał',
        lastName: 'Szymański',
        role: 'student',
        preferredLanguage: 'en'
      },
      {
        email: 'mentor2@study-smart.pl',
        password: 'MentorPass123!',
        firstName: 'Katarzyna',
        lastName: 'Woźniak',
        role: 'mentor',
        preferredLanguage: 'pl'
      },
      {
        email: 'student5@study-smart.pl',
        password: 'StudentPass123!',
        firstName: 'Paweł',
        lastName: 'Kozłowski',
        role: 'student',
        preferredLanguage: 'pl'
      },
      {
        email: 'instruktor3@study-smart.pl',
        password: 'InstruktorPass123!',
        firstName: 'Robert',
        lastName: 'Jankowski',
        role: 'instruktor',
        preferredLanguage: 'en'
      },
      {
        email: 'student6@study-smart.pl',
        password: 'StudentPass123!',
        firstName: 'Agnieszka',
        lastName: 'Mazur',
        role: 'student',
        preferredLanguage: 'en'
      }
    ];

    console.log('👥 Tworzę użytkowników...');
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });
      console.log(`✅ Utworzono użytkownika: ${user.email} (${user.role})`);
    }

    const totalUsers = await prisma.user.count();
    console.log(`🎉 Seedowanie zakończone! Utworzono ${totalUsers} użytkowników.`);

    // Podsumowanie
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    console.log('\n📊 Podsumowanie użytkowników:');
    usersByRole.forEach(group => {
      console.log(`   ${group.role}: ${group._count.role}`);
    });

  } catch (error) {
    console.error('❌ Błąd podczas seedowania użytkowników:', error);
    throw error;
  }
};

// Uruchom jeśli wywołano bezpośrednio
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('✅ Seedowanie zakończone pomyślnie');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Błąd seedowania:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedUsers; 