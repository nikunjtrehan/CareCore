// src/pages/NurseDashboard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommandCenterModal from '../components/CommandCenterModal';
import EmailVerificationBanner from '../components/EmailVerificationBanner';

const tasks = [
  { id: 1, time: '08:30', label: 'Vitals check — Room 302', patient: 'John Doe',     type: 'vitals', done: true  },
  { id: 2, time: '09:00', label: 'Administer Ibuprofen 400mg', patient: 'Sara Kim',  type: 'meds',   done: true  },
  { id: 3, time: '09:30', label: 'Wound dressing — Room 310', patient: 'Bob Walsh',  type: 'care',   done: false },
  { id: 4, time: '10:00', label: 'Vitals check — Room 305', patient: 'Alice Ford',   type: 'vitals', done: false },
  { id: 5, time: '10:30', label: 'Administer Insulin 10U', patient: 'Ravi Sharma',   type: 'meds',   done: false },
  { id: 6, time: '11:00', label: 'Post-op monitoring — Room 308', patient: 'Carla M.', type: 'care', done: false },
  { id: 7, time: '12:00', label: 'Lunch meds — Room 302, 305', patient: 'Multiple',  type: 'meds',   done: false },
];

const typeStyle = {
  vitals: 'bg-blue-500/20 text-blue-300',
  meds:   'bg-purple-500/20 text-purple-300',
  care:   'bg-teal-500/20 text-teal-300',
};

const typeLabel = { vitals: '♥ Vitals', meds: '💊 Meds', care: '🩹 Care' };

export default function NurseDashboard() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [taskList, setTaskList] = useState(tasks);
  const [handoffNote, setHandoffNote] = useState('Room 302 (John Doe) reported mild nausea after breakfast. Monitored for 1 hr — symptoms subsided. BP stable at 118/76.');
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('tasks');

  const name = user?.displayName?.split(' ')[0] || 'Nurse';
  const handleLogOut = async () => { await logOut(); navigate('/auth'); };

  const toggleTask = (id) =>
    setTaskList(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const done  = taskList.filter(t => t.done).length;
  const total = taskList.length;
  const pct   = Math.round((done / total) * 100);

  const saveNote = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex" style={{ cursor: 'auto' }}>

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white/[0.03] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-mono text-lg font-bold tracking-tight">CareCore.</h1>
          <p className="text-white/30 text-xs mt-0.5">Nursing Portal</p>
        </div>

        {/* Shift progress ring */}
        <div className="p-6 border-b border-white/5 flex flex-col items-center gap-3">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="rgb(45,212,191)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset="0"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{pct}%</span>
            </div>
          </div>
          <p className="text-white/40 text-xs text-center">{done} of {total} tasks done</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'tasks',   label: 'Shift Tasks',   icon: '📋' },
            { id: 'ward',    label: 'Ward Status',   icon: '🏥' },
            { id: 'handoff', label: 'Handoff Notes', icon: '📝' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                tab === item.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          <CommandCenterModal />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-xs font-bold">
              {name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName || 'Nurse'}</p>
              <p className="text-white/30 text-xs">Shift: 08:00–16:00</p>
            </div>
          </div>
          <button onClick={handleLogOut} className="w-full text-left text-xs text-white/30 hover:text-red-400 transition-colors py-1 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <EmailVerificationBanner />
        <div className="p-8 flex-1">
        <AnimatePresence mode="wait">
        {tab === 'ward' && (
          <motion.div key="ward" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="text-6xl mb-4">🏥</div>
            <h2 className="text-2xl font-bold mb-2">Ward Status</h2>
            <p className="text-white/30 text-sm">Real-time bed occupancy and ward monitoring — coming soon.</p>
          </motion.div>
        )}
        {tab !== 'ward' && (
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-3xl font-bold">Active Shift, {name} 🏥</h2>
          <p className="text-white/40 text-sm mt-1">{total - done} tasks remaining · Shift ends at 16:00</p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Beds Occupied', value: '24/28', icon: '🛏️', color: 'bg-blue-950/50 border-blue-500/20' },
            { label: 'Vitals Due',    value: '3',     icon: '❤️', color: 'bg-red-950/50 border-red-500/20' },
            { label: 'Meds Due',      value: '4',     icon: '💊', color: 'bg-purple-950/50 border-purple-500/20' },
            { label: 'Hours Left',    value: '4h 28m', icon: '⏱️', color: 'bg-teal-950/50 border-teal-500/20' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`rounded-2xl p-4 border ${s.color}`}
            >
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Task timeline */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4 font-mono">Task Timeline</h3>
            <div className="space-y-2">
              {taskList.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all duration-300 ${
                    task.done
                      ? 'border-white/5 bg-white/[0.01] opacity-50'
                      : 'border-white/8 bg-white/[0.03] hover:border-white/15'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      task.done ? 'bg-teal-500 border-teal-500' : 'border-white/20 hover:border-white/50'
                    }`}
                  >
                    {task.done && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>

                  <span className="font-mono text-xs text-white/30 w-12 shrink-0">{task.time}</span>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.done ? 'line-through text-white/30' : 'text-white'}`}>
                      {task.label}
                    </p>
                    <p className="text-xs text-white/30">{task.patient}</p>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeStyle[task.type]}`}>
                    {typeLabel[task.type]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        {tab === 'handoff' && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4 font-mono">Handoff Notes</h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 max-w-2xl">
              <p className="text-xs text-white/30 mb-3">For the incoming shift — summarise patient status and any anomalies.</p>
              <textarea
                value={handoffNote}
                onChange={e => { setHandoffNote(e.target.value); setSaved(false); }}
                rows={9}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80 placeholder-white/20 outline-none focus:border-white/30 resize-none leading-relaxed transition-all"
                placeholder="Type your shift handoff notes here..."
              />
              <button onClick={saveNote} className={`w-full mt-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${ saved ? 'bg-teal-500 text-black' : 'bg-white text-black hover:bg-white/90'}`}>
                {saved ? '✓ Saved' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}
        </motion.div>)}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
