import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { 
  Plus, 
  FileText, 
  Brain, 
  Sparkles, 
  LogOut, 
  User, 
  History, 
  ArrowRight,
  Search,
  BookOpen,
  MessageCircle,
  Lightbulb,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const pageSize = 6;
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate("/login");
      else {
        setUser(user);
        fetchNotes(user.id, 0);
      }
    };
    checkUser();
  }, [navigate]);

  const fetchNotes = async (userId: string, page: number) => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from("notes")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId);
      
      setTotalNotes(count || 0);

      // Get paginated notes
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (!error) setNotes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!window.confirm("A jeni të sigurt që dëshironi të fshini këtë shënim?")) return;
    
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      setNotes(notes.filter(n => n.id !== id));
      setTotalNotes(prev => prev - 1);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    navigate("/login");
  };

  const totalPages = Math.ceil(totalNotes / pageSize);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans border-t-2 border-indigo-600">
      {/* Navbar */}
      <nav className="bg-white border-b px-4 md:px-8 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <Brain className="w-5 h-5" />
            </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">AI Note</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Kërko shënimet..." className="bg-transparent border-none outline-none text-xs w-40 text-gray-600" />
          </div>
          <div className="flex items-center gap-3 border-l pl-4 border-gray-100">
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                     <User className="w-4 h-4" />
                 </div>
                 <span className="text-xs font-bold text-gray-700 hidden sm:block">{user?.email?.split('@')[0]}</span>
             </div>
             <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">Mirëseerdhe, {user?.email?.split('@')[0]}</h1>
            <p className="text-gray-500 text-sm font-bold">Menaxho shënimet tuaja dhe gjenero përmbledhje me AI.</p>
          </div>
          <button 
            onClick={() => navigate("/upload")} 
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-base shadow-lg hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:scale-95 group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" /> Krijo Shënim
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
                { title: "Përmbledhjet", icon: Sparkles, color: "bg-amber-500", route: "/summaries", desc: "Shihni përmbledhjet e gjeneruara." },
                { title: "Flashcards", icon: BookOpen, color: "bg-indigo-600", route: "/flashcards", desc: "Mësoni më shpejt me kartat." },
                { title: "Historia", icon: History, color: "bg-emerald-500", route: "/history", desc: "Aktiviteti juaj i plotë." }
            ].map((action, i) => (
                <button 
                    key={i} 
                    onClick={() => navigate(action.route)}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-indigo-100 hover:shadow-xl transition-all text-left flex flex-col group"
                >
                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-gray-500 text-[11px] mb-4 font-bold opacity-80">{action.desc}</p>
                    <div className="mt-auto flex items-center gap-1.5 text-indigo-600 text-xs font-black group-hover:translate-x-1 transition-transform">
                        EKSPLORO <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </button>
            ))}
        </div>

        {/* Recent Notes Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4 border-gray-100">
            <h2 className="text-xl font-black text-gray-900">Shënimet e Fundit</h2>
            <div className="flex items-center gap-2">
                <button 
                    disabled={currentPage === 0}
                    onClick={() => { const next = currentPage - 1; setCurrentPage(next); fetchNotes(user.id, next); }}
                    className="p-1.5 rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Faqja {currentPage + 1}</span>
                <button 
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => { const next = currentPage + 1; setCurrentPage(next); fetchNotes(user.id, next); }}
                    className="p-1.5 rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
          </div>

          <div className="relative min-h-[300px]">
          {loading ? (
            <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-200" /></div>
          ) : notes.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-gray-200" />
                </div>
              <p className="text-gray-400 mb-6 font-bold">Ende nuk keni asnjë shënim.</p>
              <button 
                onClick={() => navigate("/upload")}
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all"
              >
                Krijo Shënim
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
              {notes.map((note) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={note.id} 
                  className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col group cursor-pointer"
                  onClick={() => navigate(`/chat/${note.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <FileText className="w-4 h-4" />
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-base font-black text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{note.title}</h3>
                  <p className="text-gray-500 text-[11px] font-bold line-clamp-3 mb-6 leading-relaxed opacity-70 italic">"{note.content.substring(0, 100)}..."</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                       <div className="flex gap-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/chat/${note.id}`); }}
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="AI Chat"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); navigate("/summaries"); }}
                                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="Përmbledhja"
                            >
                                <Sparkles className="w-4 h-4" />
                            </button>
                       </div>
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          )}
          </div>
        </div>

        {/* Suggestion Section */}
        <div className="mt-16 p-8 bg-indigo-600 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100/50">
             <div className="flex-1 space-y-3">
                 <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest">
                     <Lightbulb className="w-3.5 h-3.5" /> Këshillë Studimi
                 </div>
                 <h2 className="text-2xl font-black leading-tight text-center md:text-left">Mënyra më e mirë për të memorizuar?</h2>
                 <p className="text-indigo-100 text-sm font-bold opacity-90 leading-relaxed text-center md:text-left">Përdorni AI Chat për të testuar veten rreth koncepteve kryesore. Pyetet AI: "Më bëj 3 pyetje rreth këtij teksti."</p>
             </div>
             <button onClick={() => navigate("/upload")} className="w-full md:w-auto px-8 py-3.5 bg-white text-indigo-600 rounded-2xl font-black text-base hover:scale-105 transition-all shadow-lg active:scale-95">Provo Tani</button>
        </div>
      </main>
    </div>
  );
}