import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/admin/Dashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/index" replace />} />
      <Route path="/index" element={<Home />} />
      <Route path="/bouctou_poulet/login" element={<Login />} />
      <Route path="/bouctou_poulet/admin/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
