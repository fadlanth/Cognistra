import React, { useState, useRef, useEffect } from 'react';
import { Send, Target, Atom, Beaker, Calculator, Dna, GraduationCap, Zap, Sparkles, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const App = () => {
  // 1. STATE BARU: Subjek Aktif
  const [activeSubject, setActiveSubject] = useState('fisika');
  const [mode, setMode] = useState('vocational'); 
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. ISOLASI MEMORI: Matrix 2 Dimensi (Subjek -> Mode)
  const [chatHistory, setChatHistory] = useState({
    fisika: {
      vocational: [{ role: 'assistant', content: 'Halo! ⚛️ Aku **Cognistra Fisika**. Di mode **Vocational** ini, kita akan membedah mekanika dan gaya lewat kacamata RPL.' }],
      foundation: [{ role: 'assistant', content: 'Halo! ⚛️ Di mode **Foundation** Fisika, mari fokus pada hukum dasar dan kalkulasi murni.' }]
    },
    kimia: {
      vocational: [{ role: 'assistant', content: 'Halo! 🧪 Aku **Cognistra Kimia**. Mari bedah reaksi kimia industri dan material semikonduktor.' }],
      foundation: [{ role: 'assistant', content: 'Halo! 🧪 Di mode **Foundation** Kimia, kita fokus pada tabel periodik dan ikatan molekul murni.' }]
    },
    matematika: {
      vocational: [{ role: 'assistant', content: 'Halo! 📐 Aku **Cognistra Matematika**. Mari terapkan diskrit dan aljabar boolean untuk kodinganmu.' }],
      foundation: [{ role: 'assistant', content: 'Halo! 📐 Di mode **Foundation** Matematika, kita asah logika kalkulus dan probabilitas dasar.' }]
    },
    biologi: {
      vocational: [{ role: 'assistant', content: 'Halo! 🧬 Aku **Cognistra Biologi**. Mari integrasikan ilmu hayati dengan teknologi (Bio-Tech).' }],
      foundation: [{ role: 'assistant', content: 'Halo! 🧬 Di mode **Foundation** Biologi, kita pelajari anatomi dan genetika secara akademis.' }]
    }
  });
  
  const userProfile = { id: "user_fadlan_01", name: "Fadlan", jurusan: "RPL" };
  const [userJurusan, setUserJurusan] = useState(() => {
    return localStorage.getItem('cognistra_jurusan') || 'RPL';
  });
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const chatContainerRef = useRef(null);
  const N8N_WEBHOOK_URL = "https://dlann.app.n8n.cloud/webhook/cognistra";

  useEffect(() => {
    if (!localStorage.getItem('cognistra_jurusan')) {
      setIsSetupOpen(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cognistra_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('cognistra_history');
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Gagal load history", e);
      }
    }
  }, []);

  const [progress, setProgress] = useState({
    fisika: { label: 'Fisika', level: 0, color: 'bg-blue-500', icon: <Atom size={18} className="text-blue-500"/> },
    kimia: { label: 'Kimia', level: 0, color: 'bg-emerald-500', icon: <Beaker size={18} className="text-emerald-500"/> },
    matematika: { label: 'Matematika', level: 0, color: 'bg-indigo-500', icon: <Calculator size={18} className="text-indigo-500"/> },
    biologi: { label: 'Biologi', level: 0, color: 'bg-rose-500', icon: <Dna size={18} className="text-rose-500"/> },
  });

  const subjects = [
    { id: 'fisika', label: 'Fisika', icon: <Atom size={16}/> },
    { id: 'kimia', label: 'Kimia', icon: <Beaker size={16}/> },
    { id: 'matematika', label: 'Matematika', icon: <Calculator size={16}/> },
    { id: 'biologi', label: 'Biologi', icon: <Dna size={16}/> },
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, mode, activeSubject, isLoading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    
    // Simpan ke kamar yang tepat (Subjek + Mode)
    setChatHistory(prev => ({
      ...prev,
      [activeSubject]: {
        ...prev[activeSubject],
        [mode]: [...prev[activeSubject][mode], { role: 'user', content: userText }]
      }
    }));
    
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // TAMBAHAN: Mengirim parameter subject agar AI tahu konteks persisnya
        body: JSON.stringify({ 
          chatInput: userText, 
          userId: userProfile.id, 
          mode: mode, 
          jurusan: userJurusan,
          subject: activeSubject 
        }),
      });

      const data = await response.json(); 
      
      // TAMBAHAN CODE PEMBERSIH LATEX
      const cleanOutput = (text) => {
        return text
          .replace(/\$\$?[^$]*\$\$?/g, '[Rumus Matematika]') // Ganti blok LaTeX jadi teks
          .replace(/\\[\(\[][^\\)]*\\[\)\]]/g, '[Rumus Matematika]') // Ganti inline LaTeX
          .replace(/\\[a-zA-Z]+/g, ''); // Hapus perintah latex sisa seperti \alpha, \beta
      };

      setChatHistory(prev => ({
        ...prev,
        [activeSubject]: {
          ...prev[activeSubject],
          [mode]: [...prev[activeSubject][mode], { 
            role: 'assistant', 
            content: cleanOutput(data.output),
            action: data.xp_gain > 0 ? { skill: data.skill, xp: data.xp_gain } : null 
          }]
        }
      }));

      if (data.xp_gain > 0 && progress[data.skill]) {
        setProgress(prev => ({
          ...prev,
          [data.skill]: { ...prev[data.skill], level: Math.min(100, prev[data.skill].level + data.xp_gain) }
        }));
      }
    } catch (error) {
      setChatHistory(prev => ({
        ...prev,
        [activeSubject]: {
          ...prev[activeSubject],
          [mode]: [...prev[activeSubject][mode], { role: 'assistant', content: "⚠️ Terjadi gangguan koneksi." }]
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJurusan = (jurusan) => {
    setUserJurusan(jurusan);
    localStorage.setItem('cognistra_jurusan', jurusan);
    setIsSetupOpen(false);
  };

  // Render obrolan khusus untuk kamar yang sedang dibuka
  const activeMessages = chatHistory[activeSubject][mode];

  const playAudio = (text) => {
  window.speechSynthesis.cancel(); // Stop suara sebelumnya kalau ada
  // Bersihkan teks dari markdown seperti * dan # agar enak didengar
  const cleanText = text.replace(/[*#]/g, '').replace(/\[METADATA:.*?\]/g, ''); 
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'id-ID'; // Logika bahasa Indonesia
  utterance.rate = 1.0; // Kecepatan normal
  window.speechSynthesis.speak(utterance);
};

  return (
// KODE BARU (Perhatikan h-[100dvh] dan overflow-hidden)
<div className="flex h-[100dvh] bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-100 overflow-hidden">      
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-slate-200/60 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Cognistra</h2>
              <p className="text-xs text-slate-500 font-medium tracking-wide flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" /> AUTONOMOUS STEM AGENT
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button onClick={() => setMode('vocational')} className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${mode === 'vocational' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}>Vocational</button>
              <button onClick={() => setMode('foundation')} className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${mode === 'foundation' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>Foundation</button>
            </div>
          </div>
        </header>

        {/* NAVIGATION: SUBJECT TABS (Ini yang Bikin Terisolasi) */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
          {subjects.map(subj => (
            <button
              key={subj.id}
              onClick={() => setActiveSubject(subj.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeSubject === subj.id ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              {subj.icon} {subj.label}
            </button>
          ))}
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-6 pr-4 pb-4 custom-scrollbar">
          {activeMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-3xl ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 rounded-br-sm' : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-bl-sm'}`}>
                <div className="prose prose-sm md:prose-base max-w-none leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => playAudio(msg.content)}
                    className="mt-3 flex items-center gap-2 text-xs font-bold text-indigo-200 hover:text-white bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Volume2 size={14} /> Dengarkan Audio
                  </button>
                )}
                
                {msg.action && (
                  <div className="mt-5 p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shadow-inner">
                        <Zap size={18} className="animate-bounce" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent Execution</p>
                        <p className="text-sm font-semibold text-slate-800">Skill Validation Approved</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-500 font-black text-xl">+{msg.action.xp} XP</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.action.skill}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 shadow-sm rounded-3xl rounded-bl-sm p-5 flex gap-2 items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="mt-4 relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-100 to-emerald-100 rounded-3xl blur-md opacity-50 group-hover:opacity-70 transition duration-500"></div>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder={`Tanyakan materi ${subjects.find(s => s.id === activeSubject)?.label} di sini...`} 
            className="relative w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-16 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all text-slate-700 placeholder-slate-400 shadow-sm" 
            disabled={isLoading} 
          />
          <button type="submit" disabled={isLoading} className="absolute right-3 top-3 bottom-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl transition-colors flex items-center justify-center shadow-md shadow-indigo-200">
            <Send size={18} className="text-white"/>
          </button>
        </form>
      </main>

      <aside className="w-80 bg-white border-l border-slate-100 p-8 hidden lg:flex flex-col relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.02)]">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-8 flex items-center gap-2 tracking-widest">
          <Target size={16} className="text-indigo-500"/> Skill Progress
        </h3>
        
        <div className="space-y-8">
          {Object.entries(progress).map(([key, item]) => (
            <div key={key} className={`p-3 rounded-xl transition-all ${activeSubject === key ? 'bg-slate-50 border border-slate-200 scale-105 shadow-sm' : 'border border-transparent'}`}>
              <div className="flex justify-between items-end mb-3">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">{item.icon} {item.label}</span>
                <span className="font-bold text-slate-500 text-sm">{item.level}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${item.level}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-auto p-5 bg-slate-50 border border-slate-100 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-widest border-b border-slate-200 pb-2">Active Session</p>
          <div className="text-sm font-semibold text-slate-600 space-y-2">
            <p className="flex justify-between items-center"><span>Student:</span> <span className="text-slate-900 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">{userProfile.name}</span></p>
            <p className="flex justify-between items-center"><span>Major:</span> <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{userJurusan}</span></p>
          </div>
        </div>
      </aside>

      {/* PROFILE SETUP MODAL (Hanya muncul jika belum set jurusan) */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-indigo-100">
            <div className="text-center mb-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Halo Ranger! 👋</h3>
              <p className="text-slate-500 mt-2">Sebelum mulai, sesuaikan Cognistra dengan jurusanmu agar analoginya tepat sasaran.</p>
            </div>
            
            <div className="space-y-3">
              {['RPL', 'Otomotif', 'Kuliner', 'Teknik Las', 'Listrik', 'Teknik Sipil'].map((j) => (
                <button
                  key={j}
                  onClick={() => handleSaveJurusan(j)}
                  className="w-full p-4 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-semibold text-slate-700 flex justify-between items-center group"
                >
                  <span>{j}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-indigo-600">Pilih →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;