import React from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../../services/api'

function Dashboard() {
  const user = getCurrentUser()

  return (
    <div className="container mt-4">
      <h1>Dashboard - Study Smart</h1>
      <p className="lead">Witaj, {user?.firstName}! Zarządzaj swoją nauką.</p>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3>📚</h3>
              <h5 className="card-title">Kursy</h5>
              <p className="card-text">Przeglądaj dostępne kursy i zapisuj się na nie</p>
              <Link to="/courses" className="btn btn-primary">
                Zobacz kursy
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3>📝</h3>
              <h5 className="card-title">Quizy</h5>
              <p className="card-text">Rozwiązuj quizy i sprawdzaj swoją wiedzę</p>
              <Link to="/quizzes" className="btn btn-primary">
                Rozwiąż quiz
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3>📊</h3>
              <h5 className="card-title">Postępy</h5>
              <p className="card-text">Śledź swoje postępy w nauce i lokalizacje</p>
              <Link to="/progress" className="btn btn-primary">
                Zobacz postępy
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3>📁</h3>
              <h5 className="card-title">Zasoby</h5>
              <p className="card-text">Materiały multimedialne do kursów</p>
              <Link to="/courses" className="btn btn-primary">
                Zasoby
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Szybkie statystyki</h5>
              <div className="row text-center">
                <div className="col-md-3">
                  <h3 className="text-primary">--</h3>
                  <p>Ukończone kursy</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-success">--</h3>
                  <p>Rozwiązane quizy</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-info">--</h3>
                  <p>Średni wynik</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-warning">--</h3>
                  <p>Dni nauki</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 