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
    field: 'course_id',
    references: {
      model: 'courses',
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
    allowNull: true,
    field: 'file_name'
  },
  filePath: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    field: 'file_path'
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'file_size'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'mime_type'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  accessLevel: {
    type: DataTypes.ENUM('public', 'enrolled', 'premium', 'instructor'),
    defaultValue: 'enrolled',
    field: 'access_level'
  },
  streamingConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'streaming_config'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  chunkSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'chunk_size'
  },
  uploadProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    field: 'upload_progress',
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'resources',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['course_id'] },
    { fields: ['type'] },
    { fields: ['access_level'] },
    { fields: ['is_active'] },
    { fields: ['course_id', 'type'] }
  ]
});

module.exports = Resource; 