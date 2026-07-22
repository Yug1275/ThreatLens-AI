import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

// Placeholder Pages for Phase 3
const Home = () => <div className="text-center mt-5 pt-5"><h1 className="display-4 fw-bold text-white mb-4">Welcome to ThreatLens AI</h1><p className="text-slate-400">AI-Powered Cyber Threat Intelligence</p></div>;
const Dashboard = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">Dashboard</h1><p className="text-slate-400">Dashboard placeholder</p></div>;
const Investigations = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">Investigations</h1><p className="text-slate-400">Investigations placeholder</p></div>;
const History = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">History</h1><p className="text-slate-400">History placeholder</p></div>;
const Reports = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">Reports</h1><p className="text-slate-400">Reports placeholder</p></div>;
const Settings = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">Settings</h1><p className="text-slate-400">Settings placeholder</p></div>;
const NotFound = () => <div className="text-center mt-5 pt-5"><h1 className="display-4 fw-bold text-danger mb-4">404</h1><p className="text-slate-400">Page Not Found</p></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            
            {/* Public Auth Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="investigations" element={<ProtectedRoute><Investigations /></ProtectedRoute>} />
            <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
