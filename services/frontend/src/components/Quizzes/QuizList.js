import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCourses, getCourseQuizzes } from '../../services/api'

function QuizList() {
  const [courses, setCourses] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCoursesAndQuizzes()
  }, [])

  const loadCoursesAndQuizzes = async () => {
    try {
      const coursesData = await getCourses()
      setCourses(coursesData || [])
      
      // Load quizzes for each course
      const allQuizzes = []
      for (const course of coursesData || []) {
        try {
          const courseQuizzes = await getCourseQuizzes(course.id)
          allQuizzes.push(...(courseQuizzes || []).map(quiz => ({
            ...quiz,
            courseName: course.title,
            courseId: course.id
          })))
        } catch (err) {
          console.log(`No quizzes for course ${course.id}`)
        }
      }
      setQuizzes(allQuizzes)
    } catch (err) {
      setError('Błąd ładowania quizów')
      console.error('Load quizzes error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Ładowanie...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <h1>Dostępne quizy</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {quizzes.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              Brak dostępnych quizów. Zapisz się na kursy, aby mieć dostęp do quizów.
            </div>
          </div>
        ) : (
          quizzes.map(quiz => (
            <div key={`${quiz.courseId}-${quiz.id}`} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{quiz.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    Kurs: {quiz.courseName}
                  </h6>
                  <p className="card-text">{quiz.description}</p>
                  <div className="mb-2">
                    <small className="text-muted">
                      Pytania: {quiz.questions?.length || quiz.questionCount || 'Nieznana liczba'} |
                      Czas: {quiz.timeLimit ? `${quiz.timeLimit} min` : 'Bez limitu'}
                    </small>
                  </div>
                </div>
                <div className="card-footer">
                  <Link 
                    to={`/courses/${quiz.courseId}/quizzes/${quiz.id}`} 
                    className="btn btn-primary"
                  >
                    Rozwiąż quiz
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default QuizList 