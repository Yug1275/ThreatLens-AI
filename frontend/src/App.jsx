import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Placeholder Pages
const Home = () => <div className="text-center mt-5 pt-5"><h1 className="display-4 fw-bold text-white mb-4">Welcome to ThreatLens AI</h1><p className="text-slate-400">AI-Powered Cyber Threat Intelligence</p></div>;
const Login = () => <div className="mx-auto mt-5 pt-5 glass p-5" style={{ maxWidth: '400px' }}><h1 className="h3 fw-bold text-white mb-4">Login</h1><p className="text-slate-400">Authentication placeholder</p></div>;
const Register = () => <div className="mx-auto mt-5 pt-5 glass p-5" style={{ maxWidth: '400px' }}><h1 className="h3 fw-bold text-white mb-4">Register</h1><p className="text-slate-400">Registration placeholder</p></div>;
const Dashboard = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">Dashboard</h1><p className="text-slate-400">Dashboard placeholder</p></div>;
const Profile = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">Profile</h1><p className="text-slate-400">Profile placeholder</p></div>;
const Investigations = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">Investigations</h1><p className="text-slate-400">Investigations placeholder</p></div>;
const History = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">History</h1><p className="text-slate-400">History placeholder</p></div>;
const Reports = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">Reports</h1><p className="text-slate-400">Reports placeholder</p></div>;
const Settings = () => <div className="glass p-5"><h1 className="h3 fw-bold text-white mb-4">Settings</h1><p className="text-slate-400">Settings placeholder</p></div>;
const NotFound = () => <div className="text-center mt-5 pt-5"><h1 className="display-4 fw-bold text-danger mb-4">404</h1><p className="text-slate-400">Page Not Found</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="investigations" element={<Investigations />} />
          <Route path="history" element={<History />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
