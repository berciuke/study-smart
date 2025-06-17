const { Quiz, Question, QuizSubmission, Course } = require('../models');
const { sequelize } = require('../config/db');
const userService = require('../services/user.service');

// CREATE QUIZ (instructor only)
exports.createQuiz = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { courseId } = req.params;
    const { title, description, passingScore, questions } = req.body;
    
    const token = req.header('Authorization');
    const instructor = await userService.validateInstructor(token);
    
    // Sprawdź czy kurs istnieje i należy do instruktora
    const course = await Course.findByPk(courseId, { transaction });
    if (!course || course.instructorId !== instructor.id) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Nie masz uprawnień do tego kursu' });
    }
    
    // Utwórz quiz
    const quiz = await Quiz.create({
      title,
      description,
      courseId: parseInt(courseId),
      instructorId: instructor.id,
      passingScore: passingScore || 60,
      totalQuestions: questions?.length || 0
    }, { transaction });
    
    // Utwórz pytania jeśli zostały podane
    if (questions && questions.length > 0) {
      const questionsData = questions.map((q, index) => ({
        quizId: quiz.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: index + 1
      }));
      
      await Question.bulkCreate(questionsData, { transaction });
    }
    
    await transaction.commit();
    
    const quizWithQuestions = await Quiz.findByPk(quiz.id, {
      include: [{ model: Question, as: 'questions' }]
    });
    
    res.status(201).json(quizWithQuestions);
  } catch (error) {
    await transaction.rollback();
    console.error('[createQuiz]', error);
    res.status(500).json({ error: 'Błąd tworzenia quizu', details: error.message });
  }
};

// GET QUIZ BY ID (public for enrolled students, but hide correct answers)
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Question,
          as: 'questions',
          // Don't include correct answers and explanations for security
          attributes: ['id', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'order'],
          order: [['order', 'ASC']]
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'instructorId']
        }
      ]
    });
    
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ error: 'Quiz nie został znaleziony' });
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('[getQuizById]', error);
    res.status(500).json({ error: 'Błąd pobierania quizu', details: error.message });
  }
};

// GET COURSE QUIZZES
exports.getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const quizzes = await Quiz.findAndCountAll({
      where: { 
        courseId: parseInt(courseId),
        isActive: true 
      },
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: ['id']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      quizzes: quizzes.rows,
      totalCount: quizzes.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(quizzes.count / limit)
    });
  } catch (error) {
    console.error('[getCourseQuizzes]', error);
    res.status(500).json({ error: 'Błąd pobierania quizów', details: error.message });
  }
};

// SUBMIT QUIZ (auto-grading)
exports.submitQuiz = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body; // answers: {questionId: "A", questionId: "B"}
    
    const token = req.header('Authorization');
    const user = await userService.validateUser(token);
    
    // Sprawdź czy quiz istnieje
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: ['id', 'correctAnswer']
        }
      ],
      transaction
    });
    
    if (!quiz || !quiz.isActive) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Quiz niedostępny' });
    }
    
    // Sprawdź czy user nie wysłał już odpowiedzi
    const existingSubmission = await QuizSubmission.findOne({
      where: { quizId: parseInt(quizId), userId: user.id },
      transaction
    });
    
    if (existingSubmission) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Quiz już został ukończony' });
    }
    
    // AUTO-GRADING: Oblicz wynik
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;
    
    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;
    
    // Zapisz submission
    const submission = await QuizSubmission.create({
      quizId: parseInt(quizId),
      userId: user.id,
      answers,
      score,
      correctAnswers,
      totalQuestions,
      passed,
      timeSpent: timeSpent || 0
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      message: 'Quiz ukończony pomyślnie',
      submission: {
        id: submission.id,
        score,
        correctAnswers,
        totalQuestions,
        passed,
        passingScore: quiz.passingScore
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('[submitQuiz]', error);
    res.status(500).json({ error: 'Błąd wysyłania quizu', details: error.message });
  }
};

// GET QUIZ RESULTS (for instructor)
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const token = req.header('Authorization');
    const instructor = await userService.validateInstructor(token);
    
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz || quiz.instructorId !== instructor.id) {
      return res.status(403).json({ error: 'Nie masz uprawnień do tego quizu' });
    }
    
    const offset = (page - 1) * limit;
    
    const submissions = await QuizSubmission.findAndCountAll({
      where: { quizId: parseInt(quizId) },
      attributes: ['id', 'userId', 'score', 'correctAnswers', 'totalQuestions', 'passed', 'submittedAt', 'timeSpent'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['submittedAt', 'DESC']]
    });
    
    // Basic stats
    const stats = {
      totalSubmissions: submissions.count,
      averageScore: submissions.rows.length > 0 ? 
        Math.round(submissions.rows.reduce((sum, s) => sum + s.score, 0) / submissions.rows.length) : 0,
      passRate: submissions.rows.length > 0 ?
        Math.round((submissions.rows.filter(s => s.passed).length / submissions.rows.length) * 100) : 0
    };
    
    res.json({
      quiz: { id: quiz.id, title: quiz.title, passingScore: quiz.passingScore },
      stats,
      submissions: submissions.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(submissions.count / limit),
        totalItems: submissions.count
      }
    });
  } catch (error) {
    console.error('[getQuizResults]', error);
    res.status(500).json({ error: 'Błąd pobierania wyników', details: error.message });
  }
};

// GET MY QUIZ SUBMISSIONS (for students)
exports.getMySubmissions = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const token = req.header('Authorization');
    const user = await userService.validateUser(token);
    
    const submissions = await QuizSubmission.findAll({
      include: [
        {
          model: Quiz,
          as: 'quiz',
          where: { courseId: parseInt(courseId) },
          attributes: ['id', 'title', 'passingScore']
        }
      ],
      where: { userId: user.id },
      attributes: ['id', 'score', 'correctAnswers', 'totalQuestions', 'passed', 'submittedAt'],
      order: [['submittedAt', 'DESC']]
    });
    
    res.json({ submissions });
  } catch (error) {
    console.error('[getMySubmissions]', error);
    res.status(500).json({ error: 'Błąd pobierania moich wyników', details: error.message });
  }
}; 