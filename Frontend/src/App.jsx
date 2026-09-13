import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/login'
import ForgotPassword from './pages/auth/forgotPassword'
import ResetPassword from './pages/auth/resetPassword'


const App=()=> {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
      </Routes>
    </div>
  )
}

export default App