import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Documents from './pages/Documents';
import Messages from './pages/Messages';
import Patients from './pages/Patients';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'secretary') {
    return <>{children}</>;
  }
  return <>{children}</>;
};

const RootRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'secretary') {
    return <Navigate to="/patients" />;
  }
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <PrivateRoute>
              <Documents />
            </PrivateRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <Patients />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;