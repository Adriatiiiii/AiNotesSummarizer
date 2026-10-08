import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="text-amber-600 w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-amber-600 font-semibold uppercase tracking-wider text-sm mb-2">Pushtet i plotë</p>
        <p className="text-gray-500 mb-8">{user.email}</p>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;