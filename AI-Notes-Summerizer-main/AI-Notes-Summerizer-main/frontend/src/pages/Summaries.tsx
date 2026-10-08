import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FileText, ArrowLeft, Loader2, Sparkles, Brain, List, MessageCircle } from "lucide-react";

export default function Summaries() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");

      const { data, error } = await supabase
        .from("summaries")
        .select(`
          *,
          notes (title, content, id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSummaries(data || []);
      if (data && data.length > 0) setSelectedSummary(data[0]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 lg:w-72 bg-white border-r h-auto md:h-screen md:sticky top-0 flex flex-col shadow-sm shrink-0">
        <div className="p-4 border-b">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 mb-4 text-[10px] font-black uppercase tracking-widest transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
          </button>
          <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Përmbledhjet
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[300px] md:max-h-none">
          {summaries.length === 0 ? (
            <div className="text-center py-6 px-4">
              <p className="text-gray-400 text-xs font-bold">Nuk u gjet asnjë përmbledhje.</p>
              <button onClick={() => navigate("/upload")} className="mt-3 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs">Krijo të re</button>
            </div>
          ) : (
            summaries.map((sum) => (
              <button 
                key={sum.id}
                onClick={() => setSelectedSummary(sum)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${selectedSummary?.id === sum.id ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-transparent hover:bg-gray-50 text-gray-700 hover:border-gray-200"}`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${selectedSummary?.id === sum.id ? "text-white" : "text-indigo-500"}`} />
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs truncate w-full">{sum.notes?.title || "Pa Titull"}</p>
                    <p className={`text-[9px] ${selectedSummary?.id === sum.id ? "text-indigo-100" : "text-gray-400"}`}>
                      {new Date(sum.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {selectedSummary ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">Përmbledhje AI</span>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-2 leading-tight tracking-tight uppercase">{selectedSummary.notes?.title}</h2>
              </div>
              <button 
                onClick={() => navigate(`/chat/${selectedSummary.notes?.id}`)}
                className="flex items-center gap-2 bg-white border border-indigo-600 text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm w-full sm:w-auto justify-center active:scale-95"
              >
                <MessageCircle className="w-4 h-4" /> Bisedo me AI
              </button>
            </div>

            {/* Short Summary Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-8 -mt-8 blur-3xl"></div>
                <div className="relative">
                    <h3 className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse"></div> Ideja Kryesore
                    </h3>
                    <p className="text-lg md:text-xl font-medium leading-relaxed italic opacity-95">"{selectedSummary.short_summary}"</p>
                </div>
            </div>

            {/* Detailed Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-black text-gray-900 flex items-center gap-2 mb-4 text-xs uppercase tracking-widest">
                            <List className="w-4 h-4 text-indigo-600" /> Pikat Kryesore
                        </h4>
                        <ul className="space-y-3">
                            {selectedSummary.bullet_points?.map((point: string, i: number) => (
                                <li key={i} className="flex gap-2.5 text-gray-600 text-xs font-bold leading-relaxed">
                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-indigo-400 shrink-0"></div>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                    
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-black text-gray-900 flex items-center gap-2 mb-4 uppercase tracking-wider text-[10px] text-gray-300">
                             Përmbajtja e Detajuar
                        </h4>
                        <div className="prose prose-indigo max-w-none text-gray-600 text-xs font-bold leading-relaxed whitespace-pre-wrap opacity-90 italic">
                            {selectedSummary.detailed_summary}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-black text-gray-900 flex items-center gap-2 mb-4 text-xs uppercase tracking-widest">
                            <Brain className="w-4 h-4 text-fuchsia-600" /> Konceptet Kyçe
                        </h4>
                        <div className="space-y-4">
                            {selectedSummary.key_concepts?.map((c: any, i: number) => (
                                <div key={i} className="p-3 bg-fuchsia-50/30 rounded-xl border border-fuchsia-100/50">
                                    <p className="font-black text-[11px] text-fuchsia-900 mb-0.5 uppercase tracking-tight">{c.term || c.concept}</p>
                                    <p className="text-[10px] font-bold text-gray-500 leading-relaxed italic">{c.definition || c.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-black text-gray-900 flex items-center gap-2 mb-4 text-[10px] uppercase tracking-wider text-gray-300">
                            Fjalët Kyçe & Highlights
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {selectedSummary.keywords?.map((k: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black border border-indigo-100 uppercase tracking-tighter">#{k}</span>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {selectedSummary.highlights?.map((h: string, i: number) => (
                                <div key={i} className="p-2.5 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg shadow-sm">
                                    <p className="text-[10px] text-amber-900 font-bold italic opacity-80">"{h}"</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
             <Brain className="w-16 h-16 mb-2 opacity-10" />
             <p className="text-sm font-black uppercase tracking-widest">Zgjidhni një përmbledhje.</p>
          </div>
        )}
      </div>
    </div>
  );
}
