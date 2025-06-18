import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCourses, enrollInCourse } from '../../services/api'

function CourseList() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const data = await getCourses()
      setCourses(data || [])
    } catch (err) {
      setError('Błąd ładowania kursów')
      console.error('Load courses error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId)
      alert('Zapisano na kurs!')
      loadCourses() // Refresh
    } catch (err) {
      alert('Błąd zapisu na kurs')
      console.error('Enroll error:', err)
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
      <h1>Dostępne kursy</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {courses.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              Brak dostępnych kursów. Sprawdź czy backend działa.
            </div>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">{course.description}</p>
                  <div className="mb-2">
                    <span className="badge bg-primary me-2">{course.category}</span>
                    <span className="badge bg-secondary">{course.difficulty}</span>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      Czas: {course.duration || 'Nie określono'} | 
                      Cena: {course.price ? `${course.price} zł` : 'Darmowy'}
                    </small>
                  </div>
                </div>
                <div className="card-footer">
                  <Link 
                    to={`/courses/${course.id}`} 
                    className="btn btn-outline-primary me-2"
                  >
                    Szczegóły
                  </Link>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleEnroll(course.id)}
                  >
                    Zapisz się
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CourseList 