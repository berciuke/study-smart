import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout, getCurrentUser, isAuthenticated } from '../../services/api'

function Navbar() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const authenticated = isAuthenticated()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to={authenticated ? "/dashboard" : "/"}>
          📚 Study Smart
        </Link>

        {authenticated && (
          <>
            <div className="navbar-nav me-auto">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
              <Link className="nav-link" to="/courses">Kursy</Link>
              <Link className="nav-link" to="/quizzes">Quizy</Link>
              <Link className="nav-link" to="/progress">Postępy</Link>
            </div>

            <div className="navbar-nav">
              <span className="navbar-text me-3">
                Witaj, {user?.firstName || 'Użytkownik'}!
              </span>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Wyloguj
              </button>
            </div>
          </>
        )}

        {!authenticated && (
          <div className="navbar-nav">
            <Link className="nav-link" to="/login">Logowanie</Link>
            <Link className="nav-link" to="/register">Rejestracja</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar 