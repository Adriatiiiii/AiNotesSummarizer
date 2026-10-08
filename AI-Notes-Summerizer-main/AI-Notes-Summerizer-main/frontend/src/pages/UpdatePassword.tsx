import { useState } from 'react';
import { Sparkles, Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Sigurohu që rruga është e saktë

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Kontrolli i fjalëkalimeve
    if (password !== confirmPassword) {
      setError("Fjalëkalimet nuk përputhen!");
      return;
    }

    if (password.length < 6) {
      setError("Fjalëkalimi duhet të jetë të paktën 6 karaktere!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. Përditësimi direkt në Supabase (lexon automatikisht token nga URL)
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Ndodhi një gabim gjatë përditësimit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center w-full p-6 font-sans">
      <div className="bg-white p-14 rounded-3xl shadow-[0_12px_45px_-10px_rgba(0,0,0,0.06)] border border-gray-100 w-full max-w-[680px]">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="bg-[#6366f1] p-3 rounded-xl shadow-lg shadow-indigo-100">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-gray-950 tracking-tight">NoteAI</span>
        </div>

        {/* Titulli */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold text-[#1e293b] leading-tight tracking-tighter">New Password</h1>
          <p className="text-gray-500 text-xl mt-3">Set your new account password</p>
        </div>

        {/* Mesazhi i suksesit */}
        {success && (
          <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 text-center font-medium">
            Fjalëkalimi u ndryshua me sukses! Po ridrejtoheni te Login...
          </div>
        )}

        {/* Mesazhi i gabimit */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="text-left">
            <label className="block text-base font-semibold text-gray-800 mb-2.5 ml-1">New Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-lg transition-all"
            />
          </div>

          <div className="text-left">
            <label className="block text-base font-semibold text-gray-800 mb-2.5 ml-1">Confirm Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-6 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-lg transition-all"
            />
          </div>

          <button 
            disabled={loading || success}
            className="w-full bg-[#6366f1] hover:bg-[#585af2] text-white font-extrabold py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex justify-center items-center gap-3 text-xl mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin w-7 h-7" />
            ) : (
              <>
                <Lock className="w-6 h-6" />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;