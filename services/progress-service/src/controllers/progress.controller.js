const Progress = require('../models/progress.model');
const userService = require('../services/user.service');
const courseService = require('../services/course.service');

exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    if (req.user.id !== parseInt(userId) && req.user.role !== 'administrator') {
      return res.status(403).json({ error: 'Brak uprawnień do tych danych' });
    }
    
    const where = { userId: parseInt(userId) };
    if (status) {
      if (status === 'completed') {
        where.completionPercentage = 100;
      } else if (status === 'in_progress') {
        where.completionPercentage = { $gt: 0, $lt: 100 };
      } else if (status === 'not_started') {
        where.completionPercentage = 0;
      }
    }
    
    const skip = (page - 1) * limit;
    
    const progressData = await Progress.find(where)
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Progress.countDocuments(where);
    
    const enrichedData = await Promise.all(
      progressData.map(async (progress) => {
        try {
          const courseData = await courseService.getCourseById(progress.courseId);
          return {
            ...progress.toObject(),
            course: courseData
          };
        } catch (error) {
          return progress.toObject();
        }
      })
    );
    
    res.json({
      progress: enrichedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('[getUserProgress]', error);
    res.status(500).json({ error: 'Błąd pobierania postępów', details: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { courseId, lessonId, timeSpent, longitude, latitude } = req.body;
    const userId = req.user.id;
    
    const enrollment = await courseService.getEnrollment(userId, courseId);
    if (!enrollment) {
      return res.status(403).json({ error: 'Nie jesteś zapisany na ten kurs' });
    }
    
    let progress = await Progress.findOne({ userId, courseId });
    
    if (!progress) {
      progress = new Progress({
        userId,
        courseId,
        completedLessons: [],
        totalTimeSpent: 0,
        completionPercentage: 0
      });
    }
    
    if (lessonId) {
      progress.updateProgress(lessonId);
    }
    
    if (timeSpent) {
      progress.addStudyTime(timeSpent);
    }
    
    if (longitude && latitude) {
      progress.updateLocation(longitude, latitude);
    }
    
    if (timeSpent) {
      progress.studySession = {
        startTime: new Date(Date.now() - (timeSpent * 60 * 1000)),
        endTime: new Date(),
        duration: timeSpent,
        device: req.headers['user-agent'] || 'unknown'
      };
    }
    
    await progress.save();
    
    res.json({
      message: 'Postęp zaktualizowany',
      progress: progress
    });
  } catch (error) {
    console.error('[updateProgress]', error);
    res.status(500).json({ error: 'Błąd aktualizacji postępu', details: error.message });
  }
};

exports.getCourseStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await courseService.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Kurs nie został znaleziony' });
    }
    
    if (course.instructorId !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({ error: 'Brak uprawnień do statystyk tego kursu' });
    }
    
    const stats = await Progress.getCourseStats(courseId);
    
    const progressDistribution = await Progress.aggregate([
      { $match: { courseId: parseInt(courseId) } },
      {
        $bucket: {
          groupBy: '$completionPercentage',
          boundaries: [0, 25, 50, 75, 100, 101],
          default: 'other',
          output: {
            count: { $sum: 1 },
            averageTime: { $avg: '$totalTimeSpent' }
          }
        }
      }
    ]);

    const activityHours = await Progress.aggregate([
      { $match: { courseId: parseInt(courseId) } },
      { $unwind: '$completedLessons' },
      {
        $group: {
          _id: { $hour: '$completedLessons.completedAt' },
          sessions: { $sum: 1 }
        }
      },
      { $sort: { sessions: -1 } }
    ]);
    
    res.json({
      courseStats: stats[0] || {
        totalStudents: 0,
        averageProgress: 0,
        totalTimeSpent: 0,
        activeStudents: 0
      },
      progressDistribution,
      activityHours
    });
  } catch (error) {
    console.error('[getCourseStats]', error);
    res.status(500).json({ error: 'Błąd pobierania statystyk', details: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== parseInt(userId) && req.user.role !== 'administrator') {
      return res.status(403).json({ error: 'Brak uprawnień do tych danych' });
    }
    
    const stats = await Progress.getUserStats(userId);
    
    const progressOverTime = await Progress.aggregate([
      { $match: { userId: parseInt(userId) } },
      { $unwind: '$completedLessons' },
      {
        $match: {
          'completedLessons.completedAt': {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$completedLessons.completedAt'
            }
          },
          lessonsCompleted: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      userStats: stats[0] || {
        totalCourses: 0,
        averageProgress: 0,
        totalTimeSpent: 0,
        completedCourses: 0
      },
      progressOverTime
    });
  } catch (error) {
    console.error('[getUserStats]', error);
    res.status(500).json({ error: 'Błąd pobierania statystyk użytkownika', details: error.message });
  }
};

exports.getStudyLocations = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await courseService.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Kurs nie został znaleziony' });
    }
    
    if (course.instructorId !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({ error: 'Brak uprawnień do danych lokalizacji' });
    }
    
    const locations = await Progress.getStudyLocations(courseId);
    
    res.json({
      courseId: parseInt(courseId),
      studyLocations: locations[0]?.locations || [],
      type: 'FeatureCollection',
      features: (locations[0]?.locations || []).map((location, index) => ({
        type: 'Feature',
        geometry: location,
        properties: {
          id: index,
          courseId: parseInt(courseId)
        }
      }))
    });
  } catch (error) {
    console.error('[getStudyLocations]', error);
    res.status(500).json({ error: 'Błąd pobierania lokalizacji nauki', details: error.message });
  }
}; 