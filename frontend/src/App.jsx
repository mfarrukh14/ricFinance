import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BudgetEntries from './pages/BudgetEntries';
import BudgetEntryCreate from './pages/BudgetEntryCreate';
import Reports from './pages/Reports';
import ObjectCodes from './pages/ObjectCodes';
import FiscalYears from './pages/FiscalYears';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import ContingentBills from './pages/ContingentBills';
import ScheduleOfPayments from './pages/ScheduleOfPayments';
import AsaanCheques from './pages/AsaanCheques';
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="budget" element={<BudgetEntries />} />
        <Route path="budget/new" element={<BudgetEntryCreate />} />
        <Route path="reports" element={<Reports />} />
        <Route path="object-codes" element={<ObjectCodes />} />
        <Route path="fiscal-years" element={<FiscalYears />} />
        <Route path="contingent-bills" element={<ContingentBills />} />
        <Route path="schedule-of-payments" element={<ScheduleOfPayments />} />
        <Route path="asaan-cheques" element={<AsaanCheques />} />
        <Route
          path="users"
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
