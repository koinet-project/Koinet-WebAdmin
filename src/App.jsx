import { useState } from 'react'
import { Route, Routes } from 'react-router'
import Home from './pages/home'
import AdminDashboard from './pages/admin_dash'
import MonitoringUI from './pages/monitoring'
import LoginUI from './pages/login'

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path='admin' element={<AdminDashboard />}>
        <Route index element={<MonitoringUI />} />
        <Route path='login' element={<LoginUI />} />
      </Route>
    </Routes>
  )
}
