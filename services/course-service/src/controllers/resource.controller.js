const { Resource, Course } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain', 'text/html', 'text/markdown',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// Create resource
exports.createResource = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, type, accessLevel, streamingConfig, metadata } = req.body;

    // Verify course exists and user has permission
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Basic access control - only instructors can create resources
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const resourceData = {
      courseId,
      title,
      description,
      type,
      accessLevel: accessLevel || 'enrolled',
      streamingConfig: streamingConfig ? JSON.parse(streamingConfig) : null,
      metadata: metadata ? JSON.parse(metadata) : null
    };

    // Handle file upload if present
    if (req.file) {
      resourceData.fileName = req.file.originalname;
      resourceData.filePath = req.file.path;
      resourceData.fileSize = req.file.size;
      resourceData.mimeType = req.file.mimetype;
      
      // Set chunk size for streaming based on file size
      if (req.file.size > 10 * 1024 * 1024) { // 10MB+
        resourceData.chunkSize = 1024 * 1024; // 1MB chunks
      }
    }

    const resource = await Resource.create(resourceData);

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

// Get all resources for a course
exports.getCourseResources = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type, accessLevel } = req.query;

    // Build filter conditions
    const where = { 
      courseId,
      isActive: true
    };

    if (type) where.type = type;
    if (accessLevel) where.accessLevel = accessLevel;

    const resources = await Resource.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title']
      }]
    });

    // Filter resources based on user access level
    const filteredResources = resources.filter(resource => {
      return hasResourceAccess(req.user, resource);
    });

    res.json({
      resources: filteredResources,
      count: filteredResources.length
    });
  } catch (error) {
    console.error('Get course resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

// Get single resource
exports.getResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findOne({
      where: { id, isActive: true },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title']
      }]
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check access permissions
    if (!hasResourceAccess(req.user, resource)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ resource });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
};

// Stream resource file
exports.streamResource = async (req, res) => {
  try {
    const { id } = req.params;
    const range = req.headers.range;

    const resource = await Resource.findOne({
      where: { id, isActive: true }
    });

    if (!resource || !resource.filePath) {
      return res.status(404).json({ error: 'Resource file not found' });
    }

    // Check access permissions
    if (!hasResourceAccess(req.user, resource)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = resource.filePath;
    const stat = await fs.stat(filePath);
    const fileSize = stat.size;

    if (range) {
      // Handle range requests for streaming
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': resource.mimeType || 'application/octet-stream'
      });

      const stream = require('fs').createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // Send entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': resource.mimeType || 'application/octet-stream'
      });

      const stream = require('fs').createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Stream resource error:', error);
    res.status(500).json({ error: 'Failed to stream resource' });
  }
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, accessLevel, streamingConfig, metadata } = req.body;

    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check permissions
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Create new version for significant changes
    const shouldVersion = req.body.createVersion === 'true';
    
    if (shouldVersion) {
      // Increment version and create new record
      const newVersion = resource.version + 1;
      const newResource = await Resource.create({
        ...resource.dataValues,
        id: uuidv4(),
        title: title || resource.title,
        description: description || resource.description,
        accessLevel: accessLevel || resource.accessLevel,
        streamingConfig: streamingConfig ? JSON.parse(streamingConfig) : resource.streamingConfig,
        metadata: metadata ? JSON.parse(metadata) : resource.metadata,
        version: newVersion
      });

      // Deactivate old version
      await resource.update({ isActive: false });

      res.json({
        message: 'Resource updated with new version',
        resource: newResource
      });
    } else {
      // Simple update
      const updates = {};
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (accessLevel) updates.accessLevel = accessLevel;
      if (streamingConfig) updates.streamingConfig = JSON.parse(streamingConfig);
      if (metadata) updates.metadata = JSON.parse(metadata);

      await resource.update(updates);

      res.json({
        message: 'Resource updated successfully',
        resource
      });
    }
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check permissions
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Soft delete
    await resource.update({ isActive: false });

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};

// Helper function to check resource access
function hasResourceAccess(user, resource) {
  switch (resource.accessLevel) {
    case 'public':
      return true;
    case 'enrolled':
      // TODO: Check if user is enrolled in course
      return true; // Simplified for MVP
    case 'premium':
      return user.role === 'premium' || user.role === 'instructor' || user.role === 'admin';
    case 'instructor':
      return user.role === 'instructor' || user.role === 'admin';
    default:
      return false;
  }
}

module.exports = {
  upload,
  createResource: [upload.single('file'), exports.createResource],
  getCourseResources: exports.getCourseResources,
  getResource: exports.getResource,
  streamResource: exports.streamResource,
  updateResource: exports.updateResource,
  deleteResource: exports.deleteResource
}; 