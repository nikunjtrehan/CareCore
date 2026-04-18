import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, ArrowRight, Loader2, Database } from 'lucide-react';

// Help helper for simple syntax highlighting
const highlightSQL = (sql) => {
  if (!sql) return null;
  const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'AND', 'OR', 'LIMIT'];
  const words = sql.split(/(\\s+)/);
  
  return words.map((word, i) => {
    if (keywords.includes(word.toUpperCase())) {
      return <span key={i} className="text-neon-purple font-black">{word}</span>;
    }
    if (word.startsWith("'") || word.includes("NOW()")) {
      return <span key={i} className="text-neon-green">{word}</span>;
    }
    return <span key={i} className="text-gray-300">{word}</span>;
  });
};

export default function AiCommandInput() {
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState("IDLE"); // IDLE | PROCESSING | MORPHED | REVEAL
  const [sqlResult, setSqlResult] = useState("");
  const [dataResult, setDataResult] = useState(null);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    // 1. Enter Processing State
    setState("PROCESSING");
    
    try {
      // 2. Fetch the matched SQL intent and execution from Mock NLP Router
      // 2. Fetch the matched SQL intent and execution from Mock NLP Router
      const res = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await res.json();
      
      // 3. Snap to morph state with the actual raw SQL returned!
      setSqlResult(data.query);
      setState("MORPHED");
      
      // 4. Reveal the execution table shortly after holding the morph
      setTimeout(() => {
        setDataResult(data.data);
        setState("REVEAL");
      }, 1500);

    } catch (err) {
      console.error(err);
      setState("IDLE");
    }
  };

  const resetAll = () => {
    setPrompt("");
    setSqlResult("");
    setDataResult(null);
    setState("IDLE");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center mt-6">
      
      {/* The Central Command Chassis */}
      <motion.div 
        layout
        className="w-full glass-panel flex flex-col p-2 z-20 shadow-[0_15px_50px_0_rgba(0,243,255,0.15)]"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          
          {state === "IDLE" && (
            <motion.form 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              onSubmit={handleSubmit}
              className="relative flex items-center w-full bg-black/40 rounded-lg p-2"
            >
              <div className="pl-4 pr-2">
                <Sparkles className="w-6 h-6 text-neon-blue drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
              </div>
              <input 
                ref={inputRef}
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask the Command Center... e.g. 'Which patients missed their medicine?'"
                className="w-full bg-transparent border-none text-white text-lg font-sans placeholder-gray-500 focus:ring-0 focus:outline-none p-4 tracking-wide"
              />
              <button 
                type="submit" 
                disabled={!prompt.trim()}
                className="p-3 bg-neon-blue/20 hover:bg-neon-blue/40 rounded-md transition-colors disabled:opacity-50 text-neon-blue"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.form>
          )}

          {state === "PROCESSING" && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
              className="flex items-center justify-center w-full p-6 bg-black/40 rounded-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
              <div className="flex items-center gap-4 relative z-10">
                <motion.div 
                  className="flex gap-2"
                >
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-3 h-3 rounded-full bg-neon-blue shadow-[0_0_10px_#00f3ff]" />
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-3 h-3 rounded-full bg-neon-purple shadow-[0_0_10px_#b026ff]" />
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-3 h-3 rounded-full bg-neon-red shadow-[0_0_10px_#ff073a]" />
                </motion.div>
                <span className="font-mono text-neon-blue uppercase tracking-[0.3em] font-black drop-shadow-md">Running Neural Syntax Translation...</span>
              </div>
            </motion.div>
          )}

          {(state === "MORPHED" || state === "REVEAL") && (
            <motion.div 
              key="morphed"
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 100 }}
              className="flex flex-col w-full bg-[#0a0a0a] rounded-lg p-6 border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Database className="w-24 h-24 text-white" />
              </div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                 <div className="flex items-center gap-3">
                   <Terminal className="w-5 h-5 text-neon-green" />
                   <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Compiled Raw SQL Statement</span>
                 </div>
                 <button onClick={resetAll} className="text-xs font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-widest border border-gray-800 hover:border-gray-500 px-3 py-1 rounded">Reset</button>
              </div>
              
              <div className="font-mono text-sm leading-relaxed p-4 bg-black rounded border border-white/10 overflow-x-auto whitespace-pre-wrap relative z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                {highlightSQL(sqlResult)}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Grid Reveal Sequence */}
      <AnimatePresence>
        {state === "REVEAL" && dataResult && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', delay: 0.1, bounce: 0.3 }}
            className="w-full mt-6 glass-panel overflow-hidden border-neon-green/30 shadow-[0_0_30px_rgba(57,255,20,0.1)] relative z-10"
          >
             <div className="w-full overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-black/60 border-b border-white/20 font-mono text-[10px] text-neon-green uppercase tracking-[0.2em]">
                     {dataResult.length > 0 ? (
                        Object.keys(dataResult[0]).map(k => (
                          <th key={k} className="p-4">{k.replace(/_/g, ' ')}</th>
                        ))
                     ) : (
                       <th className="p-4">Notice</th>
                     )}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/10 font-mono text-xs">
                    {dataResult.length > 0 ? (
                      dataResult.map((row, i) => (
                        <motion.tr 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          {Object.values(row).map((val, idx) => (
                             <td key={idx} className="p-4 text-gray-300">
                               {val === null || val === undefined 
                                  ? '-' 
                                  : (typeof val === 'string' && val.includes('T') && val.includes('Z') 
                                      ? new Date(val).toLocaleString() 
                                      : String(val))}
                             </td>
                          ))}
                        </motion.tr>
                      ))
                    ) : (
                      <tr><td className="p-8 text-center text-gray-500 uppercase tracking-widest font-mono">0 Rows Returned or Executed successfully.</td></tr>
                    )}
                 </tbody>
               </table>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
