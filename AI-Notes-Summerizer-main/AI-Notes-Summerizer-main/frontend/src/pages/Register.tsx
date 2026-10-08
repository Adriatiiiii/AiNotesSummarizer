import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Diçka shkoi keq gjatë regjistrimit');
      }

      setMessage({ type: 'success', text: 'Llogaria u krijua! Kontrollo email-in për konfirmim.' });
      
      // Opsionale: Pas 3 sekondave dërgoje te login
      setTimeout(() => navigate('/login'), 3000);

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center w-full p-6">
      <div className="bg-white p-12 rounded-[32px] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.08)] border border-gray-100 w-full max-w-[600px]">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="bg-[#6366f1] p-3 rounded-2xl mb-5 shadow-lg shadow-indigo-100">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">NoteAI</h1>
          <h2 className="text-[26px] font-semibold text-gray-800 mt-6">Create an account</h2>
          <p className="text-gray-500 text-[16px] mt-2">Start summarizing your notes with AI</p>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-sm border ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="text-left">
            <label className="block text-[15px] font-medium text-gray-700 mb-2 ml-1">Display Name</label>
            <input 
              required
              type="text" 
              placeholder="John Doe"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 text-lg"
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            />
          </div>

          <div className="text-left">
            <label className="block text-[15px] font-medium text-gray-700 mb-2 ml-1">Email</label>
            <input 
              required
              type="email" 
              placeholder="you@example.com"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 text-lg"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="text-left">
            <label className="block text-[15px] font-medium text-gray-700 mb-2 ml-1">Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 text-lg"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className={`w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-4 rounded-2xl transition-all duration-200 mt-4 shadow-xl shadow-indigo-100 active:scale-[0.99] text-lg flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-[16px] text-gray-500">
            Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline ml-1">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;