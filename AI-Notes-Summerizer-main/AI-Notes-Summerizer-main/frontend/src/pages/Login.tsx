import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Email ose fjalëkalimi i gabuar');
      }

      // 1. Ruajmë të dhënat në localStorage
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Sinkronizimi i klientit Supabase ne Frontend
      await supabase.auth.setSession(data.session);
      
      // 2. Marrim rolin nga të dhënat që kthen backend-i
      const userRole = data.user.role; 

      // 3. Ridrejtimi i bazuar në Rol
      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center w-full p-6 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-[#6366f1] p-2.5 rounded-xl shadow-lg shadow-indigo-100">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-gray-950 tracking-tight">NoteAI</span>
        </div>

        {/* Titulli */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#1e293b] leading-tight tracking-tighter">Welcome back</h1>
          <p className="text-gray-500 text-base mt-2">Sign in to your account</p>
        </div>

        {/* Shfaqja e gabimit nëse ka */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-semibold text-gray-800 mb-2 ml-1">Email</label>
            <input 
              required
              type="email" 
              placeholder="you@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 text-base"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-semibold text-gray-800 mb-2 ml-1">Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 text-base"
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-indigo-500 text-sm font-semibold hover:text-indigo-600 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-[#6366f1] hover:bg-[#585af2] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-100 active:scale-[0.99] text-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors ml-1">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;