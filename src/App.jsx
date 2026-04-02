/**
 * App.jsx - Main Application Entry
 * Sets up routing, context providers, and page structure.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import LaborPage from './pages/LaborPage';
import MaterialsPage from './pages/MaterialsPage';
import EquipmentPage from './pages/EquipmentPage';
import AdminExpensesPage from './pages/AdminExpensesPage';
import ReportsPage from './pages/ReportsPage';

// Initialize i18n (must be imported before components)
import './i18n';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
            }}
          />

          <Routes>
            {/* Public Route: Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes: wrapped in Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/labor" element={<LaborPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="/admin-expenses" element={<AdminExpensesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
