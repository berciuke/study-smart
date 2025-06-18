const mongoose = require('mongoose');
require('dotenv').config();
const Progress = require('../models/progress.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/study_smart');
    console.log('MongoDB połączone dla seedów');
  } catch (error) {
    console.error('Błąd połączenia MongoDB:', error);
    process.exit(1);
  }
};

// Lokalizacje GeoJSON z różnych miast Polski
const polishCities = [
  { name: 'Warszawa', coordinates: [21.0122, 52.2297] },
  { name: 'Kraków', coordinates: [19.9445, 50.0647] },
  { name: 'Wrocław', coordinates: [17.0385, 51.1079] },
  { name: 'Gdańsk', coordinates: [18.6466, 54.3520] },
  { name: 'Poznań', coordinates: [16.9251, 52.4064] },
  { name: 'Łódź', coordinates: [19.4514, 51.7592] },
  { name: 'Szczecin', coordinates: [14.5528, 53.4285] },
  { name: 'Katowice', coordinates: [19.0238, 50.2649] },
  { name: 'Lublin', coordinates: [22.5684, 51.2465] },
  { name: 'Białystok', coordinates: [23.1688, 53.1325] },
  { name: 'Toruń', coordinates: [18.5984, 53.0138] },
  { name: 'Rzeszów', coordinates: [22.0041, 50.0413] }
];

const progressData = [
  {
    userId: 1, // student1
    courseId: 1,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-15T10:30:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-16T14:20:00Z') },
      { lessonId: 3, completedAt: new Date('2024-01-17T09:45:00Z') }
    ],
    totalTimeSpent: 180, // 3 godziny
    currentLesson: 4,
    completionPercentage: 30,
    lastActivity: new Date('2024-01-17T09:45:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[0].coordinates // Warszawa
    },
    studySession: {
      startTime: new Date('2024-01-17T09:00:00Z'),
      endTime: new Date('2024-01-17T09:45:00Z'),
      duration: 45,
      device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    notes: [
      { content: 'Świetny kurs programowania!', createdAt: new Date('2024-01-15T11:00:00Z') }
    ]
  },
  {
    userId: 2, // student2
    courseId: 2,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-10T16:15:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-12T19:30:00Z') }
    ],
    totalTimeSpent: 120, // 2 godziny
    currentLesson: 3,
    completionPercentage: 20,
    lastActivity: new Date('2024-01-12T19:30:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[1].coordinates // Kraków
    },
    studySession: {
      startTime: new Date('2024-01-12T18:30:00Z'),
      endTime: new Date('2024-01-12T19:30:00Z'),
      duration: 60,
      device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  },
  {
    userId: 3, // student3
    courseId: 3,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-20T08:00:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-21T13:15:00Z') },
      { lessonId: 3, completedAt: new Date('2024-01-22T15:45:00Z') },
      { lessonId: 4, completedAt: new Date('2024-01-23T11:20:00Z') },
      { lessonId: 5, completedAt: new Date('2024-01-24T17:30:00Z') }
    ],
    totalTimeSpent: 300, // 5 godzin
    currentLesson: 6,
    completionPercentage: 50,
    lastActivity: new Date('2024-01-24T17:30:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[2].coordinates // Wrocław
    },
    studySession: {
      startTime: new Date('2024-01-24T16:30:00Z'),
      endTime: new Date('2024-01-24T17:30:00Z'),
      duration: 60,
      device: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    },
    notes: [
      { content: 'Bardzo ciekawy materiał o biznesie', createdAt: new Date('2024-01-22T16:00:00Z') }
    ]
  },
  {
    userId: 4, // student4
    courseId: 1,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-18T12:00:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-19T14:30:00Z') },
      { lessonId: 3, completedAt: new Date('2024-01-20T16:45:00Z') },
      { lessonId: 4, completedAt: new Date('2024-01-21T10:15:00Z') },
      { lessonId: 5, completedAt: new Date('2024-01-22T13:20:00Z') },
      { lessonId: 6, completedAt: new Date('2024-01-23T15:10:00Z') },
      { lessonId: 7, completedAt: new Date('2024-01-24T09:40:00Z') },
      { lessonId: 8, completedAt: new Date('2024-01-25T11:55:00Z') },
      { lessonId: 9, completedAt: new Date('2024-01-26T14:25:00Z') },
      { lessonId: 10, completedAt: new Date('2024-01-27T16:30:00Z') }
    ],
    totalTimeSpent: 600, // 10 godzin
    currentLesson: 11,
    completionPercentage: 100,
    lastActivity: new Date('2024-01-27T16:30:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[3].coordinates // Gdańsk
    },
    studySession: {
      startTime: new Date('2024-01-27T15:00:00Z'),
      endTime: new Date('2024-01-27T16:30:00Z'),
      duration: 90,
      device: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    },
    notes: [
      { content: 'Ukończyłem kurs!', createdAt: new Date('2024-01-27T16:35:00Z') }
    ]
  },
  {
    userId: 5, // student5
    courseId: 4,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-14T07:30:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-15T18:45:00Z') },
      { lessonId: 3, completedAt: new Date('2024-01-16T20:15:00Z') }
    ],
    totalTimeSpent: 135, // 2.25 godziny
    currentLesson: 4,
    completionPercentage: 30,
    lastActivity: new Date('2024-01-16T20:15:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[4].coordinates // Poznań
    },
    studySession: {
      startTime: new Date('2024-01-16T19:30:00Z'),
      endTime: new Date('2024-01-16T20:15:00Z'),
      duration: 45,
      device: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    }
  },
  {
    userId: 6, // student6
    courseId: 5,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-11T13:20:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-13T15:40:00Z') },
      { lessonId: 3, completedAt: new Date('2024-01-14T17:25:00Z') },
      { lessonId: 4, completedAt: new Date('2024-01-16T11:50:00Z') },
      { lessonId: 5, completedAt: new Date('2024-01-17T14:35:00Z') },
      { lessonId: 6, completedAt: new Date('2024-01-18T16:20:00Z') },
      { lessonId: 7, completedAt: new Date('2024-01-19T12:45:00Z') }
    ],
    totalTimeSpent: 420, // 7 godzin
    currentLesson: 8,
    completionPercentage: 70,
    lastActivity: new Date('2024-01-19T12:45:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[5].coordinates // Łódź
    },
    studySession: {
      startTime: new Date('2024-01-19T11:45:00Z'),
      endTime: new Date('2024-01-19T12:45:00Z'),
      duration: 60,
      device: 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/120.0'
    },
    notes: [
      { content: 'Język angielski to świetna inwestycja', createdAt: new Date('2024-01-18T16:30:00Z') }
    ]
  },
  {
    userId: 7, // student7
    courseId: 6,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-25T09:15:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-26T14:30:00Z') }
    ],
    totalTimeSpent: 90, // 1.5 godziny
    currentLesson: 3,
    completionPercentage: 20,
    lastActivity: new Date('2024-01-26T14:30:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[6].coordinates // Szczecin
    },
    studySession: {
      startTime: new Date('2024-01-26T13:30:00Z'),
      endTime: new Date('2024-01-26T14:30:00Z'),
      duration: 60,
      device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101'
    }
  },
  {
    userId: 8, // student8
    courseId: 7,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-12T10:45:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-14T16:20:00Z') },
      { lessonId: 3, completedAt: new Date('2024-01-15T18:35:00Z') },
      { lessonId: 4, completedAt: new Date('2024-01-17T12:10:00Z') },
      { lessonId: 5, completedAt: new Date('2024-01-18T15:50:00Z') },
      { lessonId: 6, completedAt: new Date('2024-01-20T09:25:00Z') }
    ],
    totalTimeSpent: 360, // 6 godzin
    currentLesson: 7,
    completionPercentage: 60,
    lastActivity: new Date('2024-01-20T09:25:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[7].coordinates // Katowice
    },
    studySession: {
      startTime: new Date('2024-01-20T08:25:00Z'),
      endTime: new Date('2024-01-20T09:25:00Z'),
      duration: 60,
      device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
    }
  },
  {
    userId: 9, // student9
    courseId: 8,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-21T11:30:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-22T13:45:00Z') },
      { lessonId: 3, completedAt: new Date('2024-01-23T15:20:00Z') },
      { lessonId: 4, completedAt: new Date('2024-01-24T10:55:00Z') }
    ],
    totalTimeSpent: 240, // 4 godziny
    currentLesson: 5,
    completionPercentage: 40,
    lastActivity: new Date('2024-01-24T10:55:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[8].coordinates // Lublin
    },
    studySession: {
      startTime: new Date('2024-01-24T09:55:00Z'),
      endTime: new Date('2024-01-24T10:55:00Z'),
      duration: 60,
      device: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101'
    },
    notes: [
      { content: 'Marketing cyfrowy fascynuje!', createdAt: new Date('2024-01-23T15:30:00Z') }
    ]
  },
  {
    userId: 10, // student10
    courseId: 9,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-28T08:20:00Z') }
    ],
    totalTimeSpent: 45, // 45 minut
    currentLesson: 2,
    completionPercentage: 10,
    lastActivity: new Date('2024-01-28T08:20:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[9].coordinates // Białystok
    },
    studySession: {
      startTime: new Date('2024-01-28T07:35:00Z'),
      endTime: new Date('2024-01-28T08:20:00Z'),
      duration: 45,
      device: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15'
    }
  },
  {
    userId: 11, // student11
    courseId: 10,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-16T14:10:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-18T16:25:00Z') },
      { lessonId: 3, completedAt: new Date('2024-01-20T11:40:00Z') },
      { lessonId: 4, completedAt: new Date('2024-01-22T13:55:00Z') },
      { lessonId: 5, completedAt: new Date('2024-01-24T15:15:00Z') },
      { lessonId: 6, completedAt: new Date('2024-01-26T09:30:00Z') },
      { lessonId: 7, completedAt: new Date('2024-01-27T17:45:00Z') },
      { lessonId: 8, completedAt: new Date('2024-01-28T12:20:00Z') }
    ],
    totalTimeSpent: 480, // 8 godzin
    currentLesson: 9,
    completionPercentage: 80,
    lastActivity: new Date('2024-01-28T12:20:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[10].coordinates // Toruń
    },
    studySession: {
      startTime: new Date('2024-01-28T11:20:00Z'),
      endTime: new Date('2024-01-28T12:20:00Z'),
      duration: 60,
      device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    notes: [
      { content: 'Prawie na mecie!', createdAt: new Date('2024-01-28T12:25:00Z') }
    ]
  },
  {
    userId: 12, // student12
    courseId: 11,
    completedLessons: [
      { lessonId: 1, completedAt: new Date('2024-01-19T10:00:00Z') },
      { lessonId: 2, completedAt: new Date('2024-01-21T14:15:00Z') },
      { lessonId: 3, completedAt: new Date('2024-01-23T16:30:00Z') }
    ],
    totalTimeSpent: 180, // 3 godziny
    currentLesson: 4,
    completionPercentage: 30,
    lastActivity: new Date('2024-01-23T16:30:00Z'),
    studyLocation: {
      type: 'Point',
      coordinates: polishCities[11].coordinates // Rzeszów
    },
    studySession: {
      startTime: new Date('2024-01-23T15:30:00Z'),
      endTime: new Date('2024-01-23T16:30:00Z'),
      duration: 60,
      device: 'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/120.0'
    }
  }
];

const seedProgress = async () => {
  try {
    await connectDB();
    
    // Wyczyść istniejące dane
    await Progress.deleteMany({});
    console.log('Wyczyszczono stare dane progress');
    
    // Dodaj nowe dane
    const createdProgress = await Progress.insertMany(progressData);
    console.log(`✅ Dodano ${createdProgress.length} rekordów progress`);
    
    // Sprawdź GeoJSON
    const locations = await Progress.find({ 'studyLocation.coordinates': { $ne: [0, 0] } });
    console.log(`✅ ${locations.length} rekordów z lokalizacją GeoJSON`);
    
    // Test agregacji
    const stats = await Progress.getCourseStats(1);
    console.log('✅ Test agregacji getCourseStats:', stats[0]);
    
    const userStats = await Progress.getUserStats(1);
    console.log('✅ Test agregacji getUserStats:', userStats[0]);
    
    const studyLocations = await Progress.getStudyLocations(1);
    console.log('✅ Test GeoJSON getStudyLocations:', studyLocations[0]?.locations?.length, 'lokalizacji');
    
    console.log('\n🎯 SEEDY PROGRESS ZAKOŃCZONE SUKCESEM!');
    console.log('📍 Lokalizacje z miast Polski:');
    polishCities.forEach((city, index) => {
      console.log(`   ${index + 1}. ${city.name}: [${city.coordinates.join(', ')}]`);
    });
    
  } catch (error) {
    console.error('❌ Błąd tworzenia seedów:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Uruchom jeśli wywołane bezpośrednio
if (require.main === module) {
  seedProgress();
}

module.exports = { seedProgress, progressData, polishCities }; 