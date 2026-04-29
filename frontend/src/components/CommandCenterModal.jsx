// src/components/CommandCenterModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandCenterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryResults, setQueryResults] = useState(null);
  const [sqlQuery, setSqlQuery] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setIsLoading(true);
    setError(null);
    setQueryResults(null);
    setSqlQuery(null);
    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${response.status}`);
      }
      const result = await response.json();
      setQueryResults(result.data);
      setSqlQuery(result.query);
    } catch (err) {
      console.error('AI Query error:', err);
      setError(err.message || 'Could not reach the backend. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setQueryResults(null);
    setSqlQuery(null);
    setInputValue('');
    setError(null);
  };

  return (
    <>
      {/* Trigger button — sits in sidebar footer */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 group"
      >
        <div className="w-4 h-4 rounded-full bg-[#ef4444] flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }} />
        <span className="text-xs font-mono font-bold text-white/60 group-hover:text-white uppercase tracking-widest transition-colors">
          Command Center
        </span>
        <svg className="w-3 h-3 ml-auto text-white/20 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Scrim */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black pointer-events-auto"
              style={{ zIndex: 200 }}
              onClick={() => !isLoading && handleClose()}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none px-6" style={{ zIndex: 210 }}>
              <motion.form
                key="cmd-form"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                onSubmit={handleSubmit}
                className="w-full max-w-4xl flex flex-col pointer-events-auto rounded-3xl p-5 border border-white/15 overflow-hidden"
                style={{
                  background: 'rgba(10,10,15,0.75)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  boxShadow: '0 40px 80px -20px rgba(0,0,0,0.9)',
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/8">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" style={{ boxShadow: '0 0 10px rgba(239,68,68,0.7)' }} />
                  <span className="font-mono text-xs font-bold text-white/50 uppercase tracking-widest">
                    Initialize Command Center
                  </span>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="ml-auto text-white/30 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
                  >
                    ESC
                  </button>
                </div>

                {/* Input */}
                <div className="flex items-center gap-4 w-full">
                  <input
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    placeholder={isLoading ? 'Analyzing clinical data…' : 'Ask the database… e.g. Which patients missed their meds?'}
                    className="flex-1 bg-transparent border-none outline-none font-sans text-xl text-white placeholder-white/25 px-2 transition-opacity disabled:opacity-40"
                    onKeyDown={(e) => { if (e.key === 'Escape' && !isLoading) handleClose(); }}
                  />
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-[#ef4444] flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <button
                      type="submit"
                      className="flex-shrink-0 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white px-5 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      Run ↵
                    </button>
                  )}
                </div>

                {/* Error state */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-950/50 rounded-xl border border-red-500/30 text-red-300 text-xs font-mono"
                  >
                    ⚠ {error}
                  </motion.div>
                )}

                {/* SQL Readout */}
                {sqlQuery && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-black/50 rounded-xl border border-white/5 font-mono text-xs text-green-400 overflow-x-auto"
                  >
                    {sqlQuery}
                  </motion.div>
                )}

                {/* Results Table */}
                {queryResults && queryResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full overflow-x-auto mt-4 max-h-72 overflow-y-auto"
                  >
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0">
                        <tr>
                          {Object.keys(queryResults[0]).map((key, i) => (
                            <th key={i} className="text-white/40 text-xs uppercase tracking-wider pb-2 border-b border-white/10 px-3 whitespace-nowrap bg-[#0a0a0f]">
                              {key.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {queryResults.map((row, ri) => (
                          <tr key={ri} className="hover:bg-white/[0.03] transition-colors">
                            {Object.entries(row).map(([k, v], ci) => (
                              <td key={ci} className={`py-3 px-3 text-sm ${k.toLowerCase().includes('id') ? 'font-mono text-blue-300/80 text-xs' : 'text-gray-300'}`}>
                                {v === null || v === undefined ? '—' : String(v)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {/* Empty state */}
                {queryResults && queryResults.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 py-6 border-t border-white/5 flex items-center justify-center"
                  >
                    <span className="font-mono text-white/30 uppercase tracking-widest text-xs">No records found.</span>
                  </motion.div>
                )}

                {/* Hint */}
                {!queryResults && !isLoading && (
                  <p className="mt-4 text-xs text-white/20 font-mono">
                    Try: "Show all patients with hypertension" · "Which nurses are on night shift?" · "List pending prescriptions"
                  </p>
                )}
              </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
