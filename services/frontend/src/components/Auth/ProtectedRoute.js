import React from 'react'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, isAuth }) {
  if (!isAuth) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute 