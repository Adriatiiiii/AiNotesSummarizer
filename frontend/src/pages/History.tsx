import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { 
  ArrowLeft,
  Search,
  FileText,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 12;
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory(page, search);
  }, [page, search]);

  const fetchHistory = async (p: number, q: string) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    try {
      let query = supabase
        .from("notes")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (q) {
        query = query.ilike("title", `%${q}%`);
      }

      const { data, count, error } = await query
        .range(p * pageSize, (p + 1) * pageSize - 1);

      if (!error) {
        setNotes(data || []);
        setTotal(count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!window.confirm("A jeni të sigurt?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      setNotes(notes.filter(n => n.id !== id));
      setTotal(prev => prev - 1);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-gray-900 border-t-2 border-indigo-600">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 mb-4 text-xs font-black uppercase tracking-widest transition-colors group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Dashboard
            </button>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Historia e Shënimeve</h1>
            <p className="text-gray-500 text-sm font-bold opacity-80 uppercase tracking-wide mt-1">Gjithsej {total} shënime të ruajtura</p>
          </div>

          <div className="w-full md:w-auto flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Kërko shënimet..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 w-full md:w-48 placeholder:text-gray-300" 
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
             {loading && page === 0 ? (
                 <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-200" /></div>
             ) : notes.length === 0 ? (
                 <div className="p-20 text-center opacity-50">
                     <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                     <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Nuk u gjet asnjë shënim</p>
                 </div>
             ) : (
                <div className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                    {notes.map((note) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={note.id} 
                            className="p-4 md:p-6 hover:bg-gray-50/50 transition-all flex items-center gap-4 md:gap-6 group"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                <FileText className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm md:text-base font-black text-gray-900 truncate tracking-tight">{note.title}</h3>
                                    <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">note</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] md:text-xs font-bold text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(note.created_at).toLocaleDateString()}</span>
                                    <span className="hidden sm:block">{note.content.length} karaktere</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 md:gap-2">
                                <button 
                                    onClick={() => navigate(`/chat/${note.id}`)}
                                    className="p-2 md:p-2.5 bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all" title="Chat"
                                >
                                    <MessageCircle className="w-4 h-4 md:w-4.5 md:h-4.5" />
                                </button>
                                <button 
                                    onClick={() => navigate(`/summaries`)}
                                    className="p-2 md:p-2.5 bg-gray-50 text-gray-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all" title="Summary"
                                >
                                    <Sparkles className="w-4 h-4 md:w-4.5 md:h-4.5" />
                                </button>
                                <button 
                                    onClick={() => deleteNote(note.id)}
                                    className="p-2 md:p-2.5 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all" title="Fshij"
                                >
                                    <Trash2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
             )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
                <button 
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm transition-all active:scale-90"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setPage(i)}
                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === i ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-gray-400 hover:bg-gray-100"}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button 
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                    className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm transition-all active:scale-90"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        )}

      </div>
    </div>
  );
}
