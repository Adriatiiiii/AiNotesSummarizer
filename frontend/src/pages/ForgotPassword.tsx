import { useState } from 'react';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: 'Linku për resetim u dërgua! Kontrollo email-in tënd.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
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

        {/* Titujt */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold text-[#1e293b] leading-tight tracking-tighter">Reset Password</h1>
          <p className="text-gray-500 text-xl mt-3">Enter your email to receive a reset link</p>
        </div>

        {message && (
          <div className={`mb-8 p-5 rounded-2xl border-2 ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="space-y-8">
          <div className="text-left">
            <label className="block text-base font-semibold text-gray-800 mb-2.5 ml-1">Email</label>
            <input 
              type="email" 
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#6366f1] hover:bg-[#585af2] text-white font-extrabold py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex justify-center items-center text-xl mt-4"
          >
            {loading ? <Loader2 className="animate-spin w-7 h-7" /> : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors text-lg">
            <ArrowLeft className="w-5 h-5" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;