import React, { useState, useEffect } from 'react'
import { getUserProgress, getCurrentUser } from '../../services/api'

function ProgressView() {
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = getCurrentUser()

  useEffect(() => {
    if (user?.id) {
      loadProgress()
    }
  }, [user])

  const loadProgress = async () => {
    try {
      const data = await getUserProgress(user.id)
      setProgress(data || [])
    } catch (err) {
      setError('Błąd ładowania postępów')
      console.error('Load progress error:', err)
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
      <h1>Twoje postępy w nauce</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Statystyki ogólne */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Podsumowanie</h5>
              <div className="row text-center">
                <div className="col-md-3">
                  <h3 className="text-primary">{progress.length}</h3>
                  <p>Kursy w trakcie</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-success">
                    {progress.filter(p => p.progress >= 100).length}
                  </h3>
                  <p>Ukończone kursy</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-info">
                    {progress.length > 0 ? 
                      Math.round(progress.reduce((sum, p) => sum + (p.progress || 0), 0) / progress.length) 
                      : 0}%
                  </h3>
                  <p>Średni postęp</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-warning">
                    {progress.filter(p => p.location).length}
                  </h3>
                  <p>Lokalizacje nauki</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista postępów */}
      <div className="row">
        {progress.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              Brak danych o postępach. Zacznij naukę, aby zobaczyć swoje postępy!
            </div>
          </div>
        ) : (
          progress.map(item => (
            <div key={item.id || item._id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    {item.courseName || item.courseTitle || `Kurs ${item.courseId}`}
                  </h5>
                  
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Postęp</span>
                      <span>{Math.round(item.progress || 0)}%</span>
                    </div>
                    <div className="progress">
                      <div 
                        className={`progress-bar ${
                          (item.progress || 0) >= 100 ? 'bg-success' : 
                          (item.progress || 0) >= 50 ? 'bg-warning' : 'bg-primary'
                        }`}
                        role="progressbar" 
                        style={{width: `${Math.min(item.progress || 0, 100)}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* Lokalizacja */}
                  {item.location && (
                    <div className="mb-2">
                      <strong>📍 Lokalizacja nauki:</strong>
                      <br />
                      <small className="text-muted">
                        {item.location.city || item.location.name || 'Nieznana lokalizacja'}
                        {item.location.coordinates && (
                          ` (${item.location.coordinates[1]?.toFixed(4)}, ${item.location.coordinates[0]?.toFixed(4)})`
                        )}
                      </small>
                    </div>
                  )}

                  {/* Ostatnia aktywność */}
                  {item.lastActivity && (
                    <div className="mb-2">
                      <small className="text-muted">
                        Ostatnia aktywność: {new Date(item.lastActivity).toLocaleDateString('pl-PL')}
                      </small>
                    </div>
                  )}

                  {/* Ukończone lekcje */}
                  {item.completedLessons !== undefined && item.totalLessons !== undefined && (
                    <div className="mb-2">
                      <small className="text-muted">
                        Ukończone lekcje: {item.completedLessons}/{item.totalLessons}
                      </small>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <small className="text-muted">
                    Status: 
                    <span className={`badge ms-1 ${
                      (item.progress || 0) >= 100 ? 'bg-success' : 
                      (item.progress || 0) > 0 ? 'bg-warning' : 'bg-secondary'
                    }`}>
                      {(item.progress || 0) >= 100 ? 'Ukończony' : 
                       (item.progress || 0) > 0 ? 'W trakcie' : 'Nierozpoczęty'}
                    </span>
                  </small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mapa placeholder - dla MongoDB GeoJSON */}
      {progress.some(p => p.location) && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">🗺️ Mapa lokalizacji nauki</h5>
                <div className="alert alert-info">
                  <strong>Funkcjonalność mapy w rozwoju</strong><br />
                  Wykryte {progress.filter(p => p.location).length} lokalizacji nauki.
                  Tu będzie wyświetlana interaktywna mapa z miejscami nauki (MongoDB GeoJSON).
                </div>
                {/* Tu będzie komponnet mapy gdy będzie czas */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressView 