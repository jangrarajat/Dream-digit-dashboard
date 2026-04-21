// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TodayResult from './pages/TodayResult';
import YesterdayResult from './pages/YesterdayResult';
import ChartUpload from './pages/ChartUpload';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/today-result"
            element={
              <ProtectedRoute>
                <TodayResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/yesterday-result"
            element={
              <ProtectedRoute>
                <YesterdayResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/chart-upload"
            element={
              <ProtectedRoute>
                <ChartUpload />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;