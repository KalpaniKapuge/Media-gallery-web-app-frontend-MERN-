import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '../src/pages/RegisterPage.jsx';
import LoginPage from '../src/pages/LoginPage.jsx';
import GalleryPage from '../src/components/DropzoneGallery.jsx';
import ContactPage from '../src/components/ContactForm.jsx';
import AdminUsers from '../src/pages/AdminUsers.jsx';
import Unauthorized from '../src/pages/Unauthorized.jsx';
import ProtectedRoute from '../src/components/ProtectRoute.jsx'
import HomePage from '../src/pages/HomePage.jsx';
import Navbar from '../src/components/Navbar.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
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
            {/* Redirect unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}