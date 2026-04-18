import { useEffect, useState } from 'react';
import { RefreshCcw, CheckCircle, AlertCircle, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scrollAnim = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { type: 'spring', stiffness: 100, damping: 20 },
    viewport: { once: true, margin: "-50px" }
  };

  const fetchSchedules = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/medications-due');
      if (!res.ok) throw new Error('Database integrity check failed.');
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(false);
  }, []);

  const markAsGiven = async (scheduleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/medications-due/${scheduleId}/mark-given`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: 1 }) // Hardcoded staff for demo
      });
      if (res.ok) {
        // Optimistically remove/update from list
        setSchedules(prev => prev.filter(s => s.Schedule_ID !== scheduleId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full p-6 lg:p-10 relative z-10 overflow-y-auto">
      
      <motion.header 
        {...scrollAnim}
        className="flex items-center justify-between mb-8 border-b border-white/20 pb-6 relative glass-panel p-6"
      >
        <div className="absolute -bottom-[1px] left-0 w-32 h-[2px] bg-neon-blue shadow-[0_0_15px_#00f3ff]"></div>
        
        <div>
          <h1 className="text-3xl font-mono font-black text-white tracking-[0.2em] text-glitch drop-shadow-xl" data-text="COMMAND VIEW">
            COMMAND VIEW
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Fingerprint className="text-neon-red w-4 h-4 animate-flicker" />
            <p className="text-gray-900 font-bold font-mono text-xs uppercase tracking-widest drop-shadow-md">Medication Schedule Feed // Secure SQL Link</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchSchedules(true)}
          className="flex items-center gap-2 px-6 py-2 glass-panel border-white/40 hover:bg-neon-blue/20 hover:border-neon-blue/80 transition-colors shadow-xl"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-neon-blue' : 'text-gray-900 drop-shadow-md'}`} />
          <span className="font-mono text-xs font-bold tracking-widest text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">SYNC</span>
        </motion.button>
      </motion.header>

      {error ? (
        <motion.div {...scrollAnim} className="p-4 bg-neon-red/20 border border-neon-red/50 rounded-xl flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(255,7,58,0.2)] mb-8">
          <AlertCircle className="text-neon-red w-5 h-5 animate-pulse" />
          <span className="text-red-900 font-bold font-mono text-sm tracking-widest uppercase drop-shadow-md">{error}</span>
        </motion.div>
      ) : (
        <motion.div {...scrollAnim} className="flex-1 w-full max-w-full">
          <div className="glass-panel w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/20 border-b border-white/20 font-mono text-[10px] text-gray-900 font-bold uppercase tracking-[0.2em] shadow-sm">
                  <th className="p-4 pl-6">Schedule ID</th>
                  <th className="p-4">Patient Target</th>
                  <th className="p-4">Sector</th>
                  <th className="p-4">Protocol</th>
                  <th className="p-4">T-Minus</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 border-l border-white/20 text-center pr-6">Override</th>
                </tr>
              </thead>
              <tbody 
                className="divide-y divide-white/10"
              >
                <AnimatePresence>
                  {schedules.length === 0 ? (
                    <motion.tr 
                      exit={{ opacity: 0, x: 30 }} 
                      transition={{ duration: 0.2 }}
                    >
                      <td colSpan="7" className="p-12 text-center text-gray-900 font-bold font-mono text-sm uppercase tracking-widest bg-white/10">
                        Zero pending operations found in database.
                      </td>
                    </motion.tr>
                  ) : (
                    schedules.map((sched) => (
                      <motion.tr 
                        key={sched.Schedule_ID} 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                        layout
                        className="bg-transparent hover:bg-white/20 transition-colors group"
                      >
                        <td className="p-4 pl-6 font-mono font-bold text-sm text-gray-900 drop-shadow-sm">#{sched.Schedule_ID}</td>
                        <td className="p-4">
                          <div className="font-extrabold text-gray-900 uppercase tracking-wider drop-shadow-sm">{sched.Patient_Last_Name}, {sched.Patient_First_Name}</div>
                          <div className="text-[10px] text-gray-800 font-bold font-mono mt-1 tracking-widest drop-shadow-sm">ID: {sched.Patient_ID}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-900 font-bold font-mono drop-shadow-sm">
                          RM-{sched.Room_Number} <br/> <span className="text-[10px] text-neon-blue tracking-widest drop-shadow-sm">BD-{sched.Bed_ID}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-neon-blue font-mono font-black text-sm tracking-widest uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{sched.Drug_Name}</div>
                          <div className="text-[10px] text-gray-900 font-bold mt-1 uppercase tracking-widest font-mono drop-shadow-sm">{sched.Dosage} | {sched.Standard_Route}</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-sm text-gray-900 tracking-widest drop-shadow-sm">
                          {new Date(sched.Scheduled_Time).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                        </td>
                        <td className="p-4 text-center">
                          <span className={sched.Status === 'Pending' ? 'status-neon-red' : 'status-neon-green'}>
                            {sched.Status}
                          </span>
                        </td>
                        <td className="p-4 border-l border-white/20 text-center pr-6">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAsGiven(sched.Schedule_ID)}
                            className="flex items-center justify-center gap-2 mx-auto text-neon-green hover:text-neon-green transition-all border border-transparent hover:border-neon-green bg-white/20 hover:bg-neon-green/30 hover:shadow-[0_0_20px_rgba(57,255,20,0.8)] px-4 py-2 rounded-lg"
                          >
                            <CheckCircle className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                            <span className="font-mono text-[10px] uppercase tracking-widest hidden xl:inline-block font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Execute</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
