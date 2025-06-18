import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout, getCurrentUser, isAuthenticated } from '../../services/api'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'

function Navbar() {
  const navigate = useNavigate()
  const { t } = useTranslation(['navigation', 'common'])
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
              <Link className="nav-link" to="/dashboard">{t('dashboard', { ns: 'navigation' })}</Link>
              <Link className="nav-link" to="/courses">{t('courses', { ns: 'navigation' })}</Link>
              <Link className="nav-link" to="/quizzes">{t('quizzes', { ns: 'navigation' })}</Link>
              <Link className="nav-link" to="/progress">{t('progress', { ns: 'navigation' })}</Link>
            </div>

            <div className="d-flex align-items-center">
              <span className="navbar-text me-3">
                {t('welcome', { ns: 'navigation', name: user?.firstName || t('user', {ns: 'navigation'}) })}
              </span>
              <LanguageSwitcher />
              <button 
                className="btn btn-outline-light btn-sm ms-3"
                onClick={handleLogout}
              >
                {t('buttons.logout', { ns: 'common' })}
              </button>
            </div>
          </>
        )}

        {!authenticated && (
          <div className="navbar-nav d-flex flex-row align-items-center">
            <Link className="nav-link" to="/login">{t('login', { ns: 'navigation' })}</Link>
            <Link className="nav-link" to="/register">{t('register', { ns: 'navigation' })}</Link>
            <div className="ms-3">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar 