import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

// Components
import Navbar from './components/Layout/Navbar'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Dashboard from './components/Dashboard/Dashboard'
import CourseList from './components/Courses/CourseList'
import QuizList from './components/Quizzes/QuizList'
import ProgressView from './components/Progress/ProgressView'

// API
import { isAuthenticated } from './services/api'

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated())

  // Funkcja do przekazania do komponentów potomnych
  const handleAuthChange = () => {
    setIsAuth(isAuthenticated())
  }

  // Nasłuchuj na zmiany w localStorage, aby odświeżyć stan
  // To na wypadek, gdyby token został usunięty w innej karcie
  useEffect(() => {
    const handleStorageChange = () => {
      handleAuthChange();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar key={isAuth.toString()} />
        
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={!isAuth ? <Login onLoginSuccess={handleAuthChange} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuth ? <Register onRegisterSuccess={handleAuthChange} /> : <Navigate to="/dashboard" />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute isAuth={isAuth}>
                <CourseList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quizzes" 
            element={
              <ProtectedRoute isAuth={isAuth}>
                <QuizList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ProgressView />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirects */}
          <Route 
            path="/" 
            element={
              isAuth ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/login" />
            } 
          />
          
          {/* Catch all - redirect to dashboard or login */}
          <Route 
            path="*" 
            element={
              isAuth ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
