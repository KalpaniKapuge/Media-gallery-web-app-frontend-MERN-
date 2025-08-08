import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/unauthorized" replace />;

  return children;
}
