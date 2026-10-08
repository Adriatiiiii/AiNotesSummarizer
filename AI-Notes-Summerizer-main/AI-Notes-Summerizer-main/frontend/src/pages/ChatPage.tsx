import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import axios from "axios";
import { Send, Bot, User, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:5000/api/ai";

export default function ChatPage() {
  const { noteId } = useParams();
  const [note, setNote] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchNote = async () => {
    setInitialLoading(true);
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();
      
      if (error) throw error;
      setNote(data);
    } catch (err) {
      console.error(err);
      navigate("/dashboard");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { role: "user", content: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      // FIX: Limit history to last 10 messages to prevent "blocking" or exceeding token limits
      const limitedHistory = chatHistory.slice(-10);

      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: userMessage.content,
        context: note.content,
        history: limitedHistory
      }, {
        timeout: 60000 // Increased to 60 seconds for slower models
      });

      const botMessage = { role: "assistant", content: response.data.reply };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      let errorText = err.response?.data?.error || "Ndodhi një gabim gjatë bisedës.";
      if (err.code === 'ECONNABORTED') {
        errorText = "AI u vonua shumë (mbi 60s). Provojeni përsëri ose shkurtoni pyetjen.";
      } else if (err.response?.status === 429) {
        errorText = "⏳ Keni dërguar shumë mesazhe. Prisni 30 sekonda dhe provoni përsëri.";
      }
      const errorMessage = { role: "assistant", content: errorText };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col font-sans border-t-2 border-indigo-600 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b px-4 md:px-6 py-2 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all group">
            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <h1 className="text-xs md:text-sm font-black text-gray-900 truncate max-w-[120px] sm:max-w-xs uppercase tracking-tight">{note?.title}</h1>
            </div>
            <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mt-0.5 opacity-60">Asistent Interaktiv AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="hidden sm:flex -space-x-1.5 opacity-40">
                 <div className="w-6 h-6 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-indigo-600 font-black text-[8px]">AI</div>
                 <div className="w-6 h-6 rounded-full bg-emerald-100 border border-white flex items-center justify-center text-emerald-600 font-bold text-[8px]"><Sparkles className="w-3 h-3" /></div>
            </div>
        </div>
      </header>

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 scroll-smooth" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
                {chatHistory.length === 0 ? (
                    <div className="h-[50vh] flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 border border-gray-100">
                            <Bot className="w-7 h-7 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">Përshëndetje! Jam AI yt.</h2>
                        <p className="text-gray-500 text-[11px] font-bold max-w-xs leading-relaxed opacity-60 px-4 uppercase tracking-widest">
                            Pyet asistentin për<strong> "{note?.title}"</strong>.
                        </p>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-4 sm:px-0">
                            {["Shpjegim i shkurtër", "Më bëj një pyetje", "Konceptet kryesore", "Përmbledhje në 3 pika"].map((hint) => (
                                <button key={hint} onClick={() => { setMessage(hint); }} className="p-3 bg-white hover:bg-indigo-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-all text-left flex justify-between group shadow-sm active:scale-95">
                                    {hint}
                                    <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    chatHistory.map((msg, i) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={i} 
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white border text-indigo-600"}`}>
                                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl shadow-sm text-xs md:text-sm font-bold leading-relaxed ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-gray-700 rounded-tl-none border border-gray-100 italic"}`}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))
                )}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-indigo-200 animate-spin" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1 items-center">
                            <span className="w-1 h-1 bg-indigo-200 rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-indigo-200 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1 h-1 bg-indigo-200 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-white border-t">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSend} className="relative group">
            <textarea
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Pyet asistentin..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-5 pr-14 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm text-xs font-black uppercase tracking-tight placeholder:text-gray-300"
            />
            <button 
                type="submit" 
                disabled={!message.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-90"
            >
                <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[8px] text-gray-300 text-center mt-2.5 font-black uppercase tracking-widest opacity-60">Kontrolloni informacionin e rëndësishëm.</p>
        </div>
      </footer>
    </div>
  );
}
