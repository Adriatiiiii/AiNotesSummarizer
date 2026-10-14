import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword'; 
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/upload';
import AdminDashboard from './pages/AdminDashboard';
import Summaries from './pages/Summaries';
import ChatPage from './pages/ChatPage';
import Flashcards from './pages/flashCards';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/summaries" element={<Summaries />} />
        <Route path="/chat/:noteId" element={<ChatPage />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;