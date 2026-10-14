import { useState, useEffect } from "react";
import { BookOpen, Play, Loader2, Trash2, Check, ArrowLeft, Rotate3D, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function Flashcards() {
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");

      const { data, error } = await supabase
        .from("flashcards")
        .select(`
          *,
          notes (title)
        `)
        .order("created_at", { ascending: false });
      
      if (!error && data) setCards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDeleteSelection = (id: string) => {
    setSelectedForDelete((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmDelete = async () => {
    const idsToDelete = Array.from(selectedForDelete);
    const { error } = await supabase.from("flashcards").delete().in("id", idsToDelete);
    
    if (!error) {
      setCards(cards.filter(c => !selectedForDelete.has(c.id)));
      setSelectedForDelete(new Set());
      setDeleteMode(false);
      alert("Kartat u fshinë!");
    }
  };

  const startStudy = () => {
    if (cards.length === 0) return;
    setIsStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isStudyMode && cards.length > 0) {
    const currentCard = cards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / cards.length) * 100;

    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 md:p-6 border-t-2 border-indigo-600">
        <button onClick={() => setIsStudyMode(false)} className="absolute top-6 left-6 flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" /> MBRAPA
        </button>

        <div className="w-full max-w-md mb-8">
            <div className="flex justify-between items-end mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                <span>Sesioni i Studimit</span>
                <span className="text-indigo-600">{currentCardIndex + 1} / {cards.length}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-indigo-600 rounded-full"
                />
            </div>
        </div>
        
        <div className="w-full max-w-md h-[320px] perspective-2000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div 
                className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front */}
                <div className="absolute inset-0 bg-white rounded-3xl p-8 backface-hidden flex flex-col items-center justify-center text-center border border-gray-100 italic shadow-sm">
                    <div className="absolute top-6 left-6 flex items-center gap-1.5 opacity-40">
                         <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-indigo-900">Pyetja</span>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-gray-900 leading-tight px-4 uppercase tracking-tighter">{currentCard.question}</p>
                    <div className="absolute bottom-6 flex flex-col items-center gap-1.5 text-gray-300">
                        <Rotate3D className="w-4 h-4 animate-bounce" />
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Kliko për ta kthyer</span>
                    </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-indigo-600 rounded-3xl p-8 backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center text-white shadow-xl">
                    <div className="absolute top-6 left-6 flex items-center gap-1.5 opacity-70">
                         <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100">Përgjigja</span>
                    </div>
                    <p className="text-base md:text-lg font-bold leading-relaxed px-4 opacity-95">{currentCard.answer}</p>
                </div>
            </motion.div>
        </div>

        <div className="mt-10 flex items-center gap-8">
            <button 
                disabled={currentCardIndex === 0}
                onClick={(e) => { e.stopPropagation(); setCurrentCardIndex(prev => prev - 1); setIsFlipped(false); }}
                className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if (currentCardIndex < cards.length - 1) {
                        setCurrentCardIndex(prev => prev + 1);
                        setIsFlipped(false);
                    } else {
                        setIsStudyMode(false);
                    }
                }}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
            >
                {currentCardIndex === cards.length - 1 ? "Përfundo" : "Vazhdo"}
                {currentCardIndex !== cards.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
        </div>
        
        <style>{`
          .perspective-2000 { perspective: 2000px; }
          .preserve-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 border-t-2 border-indigo-600">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-3">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 text-[10px] font-black transition-all uppercase tracking-widest group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" /> DASHBOARD
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Flashcards</h1>
            <p className="text-gray-500 text-sm font-bold opacity-80 uppercase tracking-wide">Mësoni më shpejt me kartat e studimit.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {!deleteMode ? (
              <button onClick={() => setDeleteMode(true)} className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-xl text-[10px] font-black transition-all shadow-sm uppercase tracking-widest">
                <Trash2 className="w-3.5 h-3.5" /> Menaxho
              </button>
            ) : (
              <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                <button onClick={() => setDeleteMode(false)} className="px-4 py-1.5 text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Anulo</button>
                <button onClick={confirmDelete} disabled={selectedForDelete.size === 0} className="bg-red-600 text-white px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow shadow-red-100 flex items-center gap-1.5">
                   <Trash2 className="w-3.5 h-3.5" /> Fshij ({selectedForDelete.size})
                </button>
              </div>
            )}
            {cards.length > 0 && !deleteMode && (
                 <button onClick={startStudy} className="flex items-center gap-2.5 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-indigo-700 transition-all group active:scale-95">
                    <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Fillo Studimin
                 </button>
            )}
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 md:p-24 text-center border-2 border-dashed border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-400 text-base font-black uppercase tracking-widest mb-8 opacity-70">Nuk u gjet asnjë flashcard.</p>
            <button onClick={() => navigate("/upload")} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-base shadow-xl active:scale-95">
              Gjenero me AI
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
            {cards.map((card) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={card.id}
                onClick={() => deleteMode && toggleDeleteSelection(card.id)}
                className={`group p-6 rounded-3xl border transition-all cursor-pointer h-[220px] shadow-sm flex flex-col justify-between ${
                  selectedForDelete.has(card.id) ? "border-red-500 bg-red-50/50" : "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/10"
                }`}
              >
                <div>
                   <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-1.5">
                             <div className={`w-1.5 h-1.5 rounded-full ${selectedForDelete.has(card.id) ? "bg-red-500" : "bg-indigo-300"}`}></div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Kartë Studimi</span>
                        </div>
                        {deleteMode && (
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedForDelete.has(card.id) ? "bg-red-500 border-red-500 shadow-sm" : "border-gray-100 group-hover:border-red-100"}`}>
                            {selectedForDelete.has(card.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                        )}
                   </div>
                   <p className="text-gray-900 font-black text-sm leading-snug line-clamp-4 uppercase tracking-tighter italic">{card.question}</p>
                </div>
                
                <div className="flex justify-between items-end">
                     <div className="overflow-hidden">
                          <p className="text-[8px] text-gray-300 uppercase font-black mb-0.5 tracking-widest">Burimi</p>
                          <p className="text-[10px] font-black text-indigo-400 truncate w-32 uppercase tracking-tight">{card.notes?.title || "Pa Titull"}</p>
                     </div>
                     <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white shadow-sm">
                          <Rotate3D className="w-4 h-4" />
                     </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}