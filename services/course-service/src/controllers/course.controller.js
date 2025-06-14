const { Course, Enrollment } = require('../models');
const { sequelize } = require('../config/db');
const userService = require('../services/user.service');

// CREATE z transakcją
exports.createCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { title, description, category, difficulty, duration, price } = req.body;
    
    const token = req.header('Authorization');
    const instructor = await userService.validateInstructor(token);
    
    const course = await Course.create({
      title,
      description,
      category,
      difficulty,
      duration,
      price,
      instructorId: instructor.id
    }, { transaction });
    
    await transaction.commit();
    res.status(201).json(course);
  } catch (error) {
    await transaction.rollback();
    console.error('[createCourse]', error);
    res.status(500).json({ error: 'Błąd tworzenia kursu', details: error.message });
  }
};

// GET ALL z joins i agregacjami
exports.getAllCourses = async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 10 } = req.query;
    
    const where = { isActive: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    
    const offset = (page - 1) * limit;
    
    const courses = await Course.findAndCountAll({
      where,
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          attributes: ['id'], 
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true 
    });
    
    res.json({
      courses: courses.rows,
      totalCount: courses.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(courses.count / limit)
    });
  } catch (error) {
    console.error('[getAllCourses]', error);
    res.status(500).json({ error: 'Błąd pobierania kursów', details: error.message });
  }
};

// GET BY ID z pełnymi joins
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByPk(id, {
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          attributes: ['userId', 'enrolledAt', 'status', 'progress']
        }
      ]
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Kurs nie został znaleziony' });
    }
    
    try {
      const instructorData = await userService.getUserById(course.instructorId);
      course.dataValues.instructor = instructorData;
    } catch (error) {
      console.warn('[getCourseById] Błąd pobierania instruktora:', error.message);
      course.dataValues.instructor = null;
    }
    
    res.json(course);
  } catch (error) {
    console.error('[getCourseById]', error);
    res.status(500).json({ error: 'Błąd pobierania kursu', details: error.message });
  }
};

// ENROLLMENT z transakcją
exports.enrollInCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id: courseId } = req.params;
    const token = req.header('Authorization');
    
    const user = await userService.validateUser(token);
    
    const course = await Course.findByPk(courseId, { transaction });
    if (!course || !course.isActive) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Kurs niedostępny' });
    }
    
    const existingEnrollment = await Enrollment.findOne({
      where: { userId: user.id, courseId },
      transaction
    });
    
    if (existingEnrollment) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Już jesteś zapisany na ten kurs' });
    }
    
    const enrollment = await Enrollment.create({
      userId: user.id,
      courseId
    }, { transaction });
    
    await transaction.commit();
    res.status(201).json(enrollment);
  } catch (error) {
    await transaction.rollback();
    console.error('[enrollInCourse]', error);
    res.status(500).json({ error: 'Błąd zapisu na kurs', details: error.message });
  }
};

// UPDATE COURSE
exports.updateCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, duration, price, isActive } = req.body;
    
    const token = req.header('Authorization');
    const instructor = await userService.validateInstructor(token);
    
    const course = await Course.findByPk(id, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Kurs nie został znaleziony' });
    }
    
    if (course.instructorId !== instructor.id) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Nie masz uprawnień do edycji tego kursu' });
    }
    
    await course.update({
      title: title || course.title,
      description: description || course.description,
      category: category || course.category,
      difficulty: difficulty || course.difficulty,
      duration: duration || course.duration,
      price: price !== undefined ? price : course.price,
      isActive: isActive !== undefined ? isActive : course.isActive
    }, { transaction });
    
    await transaction.commit();
    res.json(course);
  } catch (error) {
    await transaction.rollback();
    console.error('[updateCourse]', error);
    res.status(500).json({ error: 'Błąd aktualizacji kursu', details: error.message });
  }
};

// DELETE COURSE
exports.deleteCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const token = req.header('Authorization');
    const instructor = await userService.validateInstructor(token);
    
    const course = await Course.findByPk(id, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Kurs nie został znaleziony' });
    }
    
    if (course.instructorId !== instructor.id) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Nie masz uprawnień do usunięcia tego kursu' });
    }
    
    await course.destroy({ transaction });
    
    await transaction.commit();
    res.json({ message: 'Kurs został usunięty' });
  } catch (error) {
    await transaction.rollback();
    console.error('[deleteCourse]', error);
    res.status(500).json({ error: 'Błąd usuwania kursu', details: error.message });
  }
};

// GET ENROLLMENTS dla studenta
exports.getMyEnrollments = async (req, res) => {
  try {
    const token = req.header('Authorization');
    const user = await userService.validateUser(token);
    
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { userId: user.id };
    if (status) where.status = status;
    
    const enrollments = await Enrollment.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty', 'duration', 'price']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['enrolledAt', 'DESC']]
    });
    
    res.json({
      enrollments: enrollments.rows,
      totalCount: enrollments.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(enrollments.count / limit)
    });
  } catch (error) {
    console.error('[getMyEnrollments]', error);
    res.status(500).json({ error: 'Błąd pobierania zapisów', details: error.message });
  }
};

// GET ENROLLMENTS dla instruktora
exports.getCourseEnrollments = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const token = req.header('Authorization');
    const instructor = await userService.validateInstructor(token);
    
    const course = await Course.findByPk(courseId);
    if (!course || course.instructorId !== instructor.id) {
      return res.status(403).json({ error: 'Nie masz uprawnień do przeglądania zapisów tego kursu' });
    }
    
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { courseId };
    if (status) where.status = status;
    
    const enrollments = await Enrollment.findAndCountAll({
      where,
      attributes: ['id', 'userId', 'enrolledAt', 'status', 'progress'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['enrolledAt', 'DESC']]
    });
    
    res.json({
      enrollments: enrollments.rows,
      totalCount: enrollments.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(enrollments.count / limit)
    });
  } catch (error) {
    console.error('[getCourseEnrollments]', error);
    res.status(500).json({ error: 'Błąd pobierania zapisów kursu', details: error.message });
  }
}; 