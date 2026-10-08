import { useState } from "react";
import { Upload, Sparkles, CreditCard, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import axios from "axios";

const ACCEPTED_TYPES = ".txt,.pdf,.docx";
const API_BASE_URL = "http://localhost:5000/api/ai";

export default function UploadNotes() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState<"summary" | "flashcards" | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<"simple" | "normal" | "detailed">("normal");
  const [flashcardCount, setFlashcardCount] = useState(5);
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  
  const navigate = useNavigate();

  const parseFile = async (file: File) => {
    setParsing(true);
    setUploadedFileName(file.name);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/parse-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setText(response.data.text);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      setCreatedNoteId(null);
    } catch (err: any) {
      console.error(err);
      alert("Gabim gjatë procesimit të skedarit: " + (err.response?.data?.error || err.message));
    } finally {
      setParsing(false);
    }
  };

  const handleGenerate = async (type: "summary" | "flashcards") => {
    if (!text.trim()) { alert("Ju lutem shkruani diçka ose ngarkoni një skedar."); return; }
    
    setLoading(type);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Duhet të jeni të loguar!");

      let currentNoteId = createdNoteId;
      
      if (!currentNoteId) {
        const { data: note, error: noteError } = await supabase
          .from("notes")
          .insert({ 
            user_id: user.id, 
            title: title || "Shënim i Ri", 
            content: text
          })
          .select()
          .single();
  
        if (noteError) throw noteError;
        currentNoteId = note.id;
        setCreatedNoteId(note.id);
      }

      if (type === "summary") {
        const response = await axios.post(`${API_BASE_URL}/summarize`, { text, detailLevel });
        const summaryData = response.data;

        const { error: sumError } = await supabase
          .from("summaries")
          .insert({
            note_id: currentNoteId,
            short_summary: summaryData.short_summary,
            detailed_summary: summaryData.detailed_summary,
            bullet_points: summaryData.bullet_points,
            key_concepts: summaryData.key_concepts,
            keywords: summaryData.keywords,
            highlights: summaryData.highlights
          });

        if (sumError) throw sumError;
        alert("Përmbledhja u gjenerua me sukses!");
        navigate(`/dashboard`);
      } else {
        const response = await axios.post(`${API_BASE_URL}/flashcards`, { text, count: flashcardCount });
        const flashcards = response.data.flashcards;

        const { error: fcError } = await supabase
          .from("flashcards")
          .insert(
            flashcards.map((fc: any) => ({
              note_id: currentNoteId,
              question: fc.question,
              answer: fc.answer
            }))
          );

        if (fcError) throw fcError;
        alert("Kartat u gjeneruan me sukses!");
        navigate("/dashboard");
      }

    } catch (err: any) {
      alert("Gabim: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-gray-900 border-t-2 border-indigo-600">
      <div className="max-w-2xl mx-auto">
        
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 mb-6 text-[10px] font-black uppercase tracking-widest transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
        </button>

        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black mb-1 tracking-tight text-gray-900">AI Note Assistant</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wide opacity-70">Gjenero përmbledhje dhe karta studimi në Shqip.</p>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Titulli i Shënimit</label>
          <input 
            value={title} 
            onChange={(e) => { setTitle(e.target.value); setCreatedNoteId(null); }} 
            placeholder="Psh: Leksioni i Biologjisë" 
            className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-white shadow-sm text-xs font-black uppercase tracking-tight"
          />
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-gray-50 rounded-xl w-full sm:w-fit border">
          <button 
            onClick={() => setActiveTab("text")} 
            className={`flex-1 sm:flex-none py-2 px-5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "text" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Shkruaj Tekst
          </button>
          <button 
            onClick={() => setActiveTab("file")} 
            className={`flex-1 sm:flex-none py-2 px-5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "file" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Ngarko Skedar
          </button>
        </div>

        <div className="mb-8">
          {activeTab === "text" ? (
            <textarea 
              placeholder="Ngjitni ose shkruani shënimet tuaja këtu..." 
              className="w-full h-64 p-5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none bg-white shadow-sm leading-relaxed text-xs font-bold italic" 
              value={text} 
              onChange={(e) => { setText(e.target.value); setCreatedNoteId(null); }} 
            />
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if(f) parseFile(f); }}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-white shadow-sm ${dragOver ? "border-indigo-600 bg-indigo-50/50" : "border-gray-100 hover:border-indigo-300"}`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {parsing ? (
                <div className="flex flex-col items-center animate-pulse">
                  <Loader2 className="h-10 w-10 text-indigo-200 animate-spin mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duke procesuar {uploadedFileName}...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-7 w-7 text-indigo-600" />
                  </div>
                  <p className="text-sm font-black text-gray-800 uppercase tracking-tight">Tërhiq skedarin këtu</p>
                  <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mt-1 opacity-60">ose kliko për të zgjedhur</p>
                  <div className="mt-4 flex gap-2">
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[9px] font-black rounded border border-gray-100 uppercase tracking-tighter">PDF / DOCX / TXT</span>
                  </div>
                </div>
              )}
              <input id="file-input" type="file" className="hidden" accept={ACCEPTED_TYPES} onChange={(e) => { const f = e.target.files?.[0]; if(f) parseFile(f); }} />
            </div>
          )}
        </div>

        {/* AI Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Niveli i Detajeve</label>
            <div className="flex bg-gray-50 p-1 rounded-xl border">
              {(["simple", "normal", "detailed"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDetailLevel(lvl)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${detailLevel === lvl ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                >
                  {lvl === "simple" ? "Thjeshtë" : lvl === "normal" ? "Normal" : "Detajuar"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 flex justify-between">
              Numri i Kartave: <span className="text-indigo-600">{flashcardCount}</span>
            </label>
            <input
              type="range" min={3} max={15} value={flashcardCount}
              onChange={(e) => setFlashcardCount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => handleGenerate("summary")} 
            disabled={!!loading || parsing || !text}
            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-indigo-700 disabled:opacity-50 shadow-lg active:scale-95 transition-all"
          >
            {loading === "summary" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Gjenero Përmbledhjen
          </button>
          
          <button 
            onClick={() => handleGenerate("flashcards")} 
            disabled={!!loading || parsing || !text}
            className="flex-1 bg-white border border-gray-100 text-gray-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 hover:border-indigo-300 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
          >
            {loading === "flashcards" ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5 text-indigo-600" />}
            Krijo Flashcards
          </button>
        </div>
      </div>
    </div>
  );
}