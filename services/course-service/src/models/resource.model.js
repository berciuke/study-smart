const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('text', 'video', 'audio', 'document', 'simulation'),
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  filePath: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  accessLevel: {
    type: DataTypes.ENUM('public', 'enrolled', 'premium', 'instructor'),
    defaultValue: 'enrolled'
  },
  streamingConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configuration for adaptive streaming (resolutions, bitrates)'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional metadata (duration, dimensions, chapters, etc.)'
  },
  chunkSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Size of chunks for streaming (in bytes)'
  },
  uploadProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'resources',
  timestamps: true,
  indexes: [
    {
      fields: ['courseId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['accessLevel']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['courseId', 'type']
    }
  ]
});

module.exports = Resource; 