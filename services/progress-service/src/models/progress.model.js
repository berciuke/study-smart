const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true 
  },
  courseId: {
    type: Number,
    required: true,
    index: true 
  },
  
  completedLessons: [{
    lessonId: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  totalTimeSpent: {
    type: Number, 
    default: 0
  },
  
  currentLesson: {
    type: Number,
    default: 1
  },
  
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true 
  },
  
  studyLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], 
      default: [0, 0]
    }
  },
  
  studySession: {
    startTime: Date,
    endTime: Date,
    duration: Number, 
    device: String
  },
  
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true 
});

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

progressSchema.index({ studyLocation: '2dsphere' });

progressSchema.index({ lastActivity: -1 }); // sortowanie po czasie
progressSchema.index({ completionPercentage: 1 }); // filtrowanie po postępie
progressSchema.index({ 'studySession.startTime': -1 }); // sortowanie sesji

progressSchema.index({ 
  userId: 1, 
  lastActivity: -1, 
  completionPercentage: 1 
});

progressSchema.methods.updateProgress = function(lessonId) {
  if (!this.completedLessons.find(lesson => lesson.lessonId === lessonId)) {
    this.completedLessons.push({ lessonId });
    this.completionPercentage = Math.min(100, (this.completedLessons.length / 10) * 100);
    this.lastActivity = new Date();
  }
  return this;
};

progressSchema.methods.addStudyTime = function(minutes) {
  this.totalTimeSpent += minutes;
  this.lastActivity = new Date();
  return this;
};

progressSchema.methods.updateLocation = function(longitude, latitude) {
  this.studyLocation.coordinates = [longitude, latitude];
  return this;
};

progressSchema.statics.getCourseStats = function(courseId) {
  return this.aggregate([
    { $match: { courseId: parseInt(courseId) } },
    {
      $group: {
        _id: '$courseId',
        totalStudents: { $sum: 1 },
        averageProgress: { $avg: '$completionPercentage' },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        activeStudents: {
          $sum: {
            $cond: [
              { $gte: ['$lastActivity', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

progressSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: parseInt(userId) } },
    {
      $group: {
        _id: '$userId',
        totalCourses: { $sum: 1 },
        averageProgress: { $avg: '$completionPercentage' },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        completedCourses: {
          $sum: {
            $cond: [{ $eq: ['$completionPercentage', 100] }, 1, 0]
          }
        }
      }
    }
  ]);
};

progressSchema.statics.getStudyLocations = function(courseId) {
  return this.aggregate([
    { $match: { courseId: parseInt(courseId) } },
    {
      $group: {
        _id: null,
        locations: {
          $push: {
            $cond: [
              { $ne: ['$studyLocation.coordinates', [0, 0]] },
              '$studyLocation',
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        locations: {
          $filter: {
            input: '$locations',
            cond: { $ne: ['$$this', null] }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Progress', progressSchema); 