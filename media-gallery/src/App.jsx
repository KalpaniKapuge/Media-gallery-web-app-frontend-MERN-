import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '../src/pages/RegisterPage.jsx';
import LoginPage from '../src/pages/LoginPage.jsx';
import GalleryPage from '../src/pages/GalleryPage.jsx'; // Fixed import path
import ContactPage from '../src/components/ContactForm.jsx';
import AdminUsers from '../src/pages/AdminUsers.jsx';
import Unauthorized from '../src/pages/Unauthorized.jsx';
import ProtectedRoute from '../src/components/ProtectRoute.jsx'
import HomePage from '../src/pages/HomePage.jsx';
import Navbar from '../src/components/Navbar.jsx'
import ForgotPasswordPage from '../src/pages/ForgotPassword.jsx';
import ResetPasswordPage from '../src/pages/ResetPassword.jsx';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <GalleryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contact"
                element={
                  <ProtectedRoute>
                    <ContactPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}