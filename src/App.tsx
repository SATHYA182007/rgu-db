import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Analytics from './pages/Analytics';
import Scholarships from './pages/Scholarships';
import Settings from './pages/Settings';

// Route helper to protect routes that require authentication
function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem('rgu_authenticated') === 'true';
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Route helper to redirect already-authenticated users away from login/signup
function PublicOnlyRoute() {
  const isAuthenticated = localStorage.getItem('rgu_authenticated') === 'true';
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

function App() {
  return (
    <Routes>
      {/* Publicly accessible routes only when not logged in */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Protected routes that require being logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="scholarships" element={<Scholarships />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

