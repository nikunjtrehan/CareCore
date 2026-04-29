// src/pages/DoctorDashboard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommandCenterModal from '../components/CommandCenterModal';
import EmailVerificationBanner from '../components/EmailVerificationBanner';

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
    }`}
  >
    {icon}
    {label}
  </button>
);

const patients = [
  { id: 1, name: 'Alex Morrison',  age: 42, reason: 'Hypertension Follow-up',  time: '9:00 AM',  status: 'urgent',  notes: 'BP spiked to 165/100 last visit. Check Lisinopril response.' },
  { id: 2, name: 'Sara Patel',     age: 31, reason: 'Routine Checkup',          time: '9:30 AM',  status: 'normal',  notes: 'Annual physical. Patient reports no new symptoms.' },
  { id: 3, name: 'John Reeves',    age: 58, reason: 'Diabetes Review',          time: '10:00 AM', status: 'warning', notes: 'HbA1c at 8.2 last month — above target range.' },
  { id: 4, name: 'Meena Krishnan', age: 25, reason: 'Lab Result Discussion',    time: '10:30 AM', status: 'normal',  notes: 'CBC and lipid panel ordered. Results in.' },
  { id: 5, name: 'Samuel Okafor',  age: 67, reason: 'Post-surgery Follow-up',   time: '11:00 AM', status: 'warning', notes: 'Wound inspection — 2 weeks post appendectomy.' },
];

const statusBadge = {
  urgent:  'bg-red-500/20 text-red-300 border-red-500/30',
  warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  normal:  'bg-green-500/20 text-green-300 border-green-500/30',
};

const scheduleSlots = [
  { time: '9:00 AM',  patient: 'Alex Morrison',  type: 'Follow-up',    status: 'urgent' },
  { time: '9:30 AM',  patient: 'Sara Patel',      type: 'Checkup',      status: 'normal' },
  { time: '10:00 AM', patient: 'John Reeves',     type: 'Review',       status: 'warning' },
  { time: '10:30 AM', patient: 'Meena Krishnan',  type: 'Lab Results',  status: 'normal' },
  { time: '11:00 AM', patient: 'Samuel Okafor',   type: 'Post-op',      status: 'warning' },
  { time: '11:30 AM', patient: '—',               type: 'Open slot',    status: 'open' },
  { time: '2:00 PM',  patient: '—',               type: 'Open slot',    status: 'open' },
  { time: '3:00 PM',  patient: 'Telehealth TBC',  type: 'Remote',       status: 'normal' },
];

// ── Queue View ────────────────────────────────────────────────────────────────
function QueueView() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-3xl font-bold">Today's Queue</h2>
          <p className="text-white/40 text-sm mt-1">
            You have <span className="text-white font-medium">{patients.length} patients</span> scheduled
            · {patients.filter(p => p.status === 'urgent').length} urgent
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mb-6 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-red-300 text-sm font-semibold">Urgent: Alex Morrison — hypertensive spike flagged</p>
            <p className="text-red-300/60 text-xs mt-0.5">Elevated BP (165/100) at last visit. Prioritise today.</p>
          </div>
        </motion.div>

        <div className="space-y-3">
          {patients.map((p, i) => (
            <motion.button key={p.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              onClick={() => setSelected(selected?.id === p.id ? null : p)}
              className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 ${
                selected?.id === p.id ? 'border-white/20 bg-white/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">{p.name[0]}</div>
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-white/40 text-xs">{p.reason} · Age {p.age}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-white/40">{p.time}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${statusBadge[p.status]}`}>{p.status}</span>
                </div>
              </div>
              {selected?.id === p.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-2 font-mono">AI Pre-visit Summary</p>
                  <p className="text-white/70 text-sm leading-relaxed">{p.notes}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 text-xs font-medium bg-white text-black rounded-xl hover:bg-white/90 transition-colors">Open Chart</button>
                    <button className="px-4 py-2 text-xs font-medium border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/30 transition-all">Write Prescription</button>
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* AI Insights side panel */}
      <aside className="w-72 border-l border-white/5 bg-white/[0.02] p-6 overflow-y-auto hidden lg:block">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-6 font-mono">AI Insights</h3>
        <div className="space-y-4">
          {[
            { title: 'Trending: Hypertension Spike', body: '3 of your patients this week show elevated systolic BP. Consider reviewing dosage protocols.', color: 'from-red-950/80 border-red-500/20' },
            { title: 'John Reeves — HbA1c Trend', body: 'HbA1c increased 0.4 points over 3 months. Suggests revisiting Metformin dosage or diet plan.', color: 'from-amber-950/80 border-amber-500/20' },
            { title: 'Schedule Gap at 2 PM', body: 'A 30-minute slot is open. Suitable for a telehealth follow-up call.', color: 'from-blue-950/80 border-blue-500/20' },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className={`p-4 rounded-2xl bg-gradient-to-b ${card.color} border`}>
              <p className="text-xs font-semibold text-white/80 mb-1.5">{card.title}</p>
              <p className="text-xs text-white/50 leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ── Schedule View ─────────────────────────────────────────────────────────────
function ScheduleView() {
  return (
    <div className="p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-3xl font-bold">Today's Schedule</h2>
        <p className="text-white/40 text-sm mt-1">Wednesday — full day view</p>
      </motion.div>
      <div className="space-y-3">
        {scheduleSlots.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-5 px-5 py-4 rounded-2xl border ${
              s.status === 'open' ? 'border-white/5 bg-white/[0.01] opacity-50' : 'border-white/8 bg-white/[0.03]'
            }`}>
            <span className="font-mono text-xs text-white/40 w-20 shrink-0">{s.time}</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${s.status === 'open' ? 'text-white/30 italic' : 'text-white'}`}>{s.patient}</p>
              <p className="text-xs text-white/30">{s.type}</p>
            </div>
            {s.status !== 'open' && (
              <span className={`text-xs px-2.5 py-1 rounded-full border ${statusBadge[s.status] || 'bg-white/10 text-white/40 border-white/10'}`}>
                {s.status}
              </span>
            )}
            {s.status === 'open' && (
              <button className="text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1 rounded-lg transition-all">
                + Book
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── AI Insights View ──────────────────────────────────────────────────────────
function InsightsView() {
  const insights = [
    { title: 'Trending: Hypertension Spike', body: '3 of your patients this week show elevated systolic BP. Review Lisinopril dosages and schedule follow-ups within 48 hours.', color: 'bg-red-950/60 border-red-500/20', badge: 'High Priority', badgeColor: 'bg-red-500/20 text-red-300' },
    { title: 'John Reeves — HbA1c Trend', body: 'HbA1c increased 0.4 points over 3 months. Gemini suggests revisiting Metformin dosage or initiating dietary consultation.', color: 'bg-amber-950/60 border-amber-500/20', badge: 'Action Required', badgeColor: 'bg-amber-500/20 text-amber-300' },
    { title: 'Schedule Gap at 2 PM', body: 'You have an unbooked 30-minute slot. Suitable for a telehealth follow-up with a stable patient.', color: 'bg-blue-950/60 border-blue-500/20', badge: 'Opportunity', badgeColor: 'bg-blue-500/20 text-blue-300' },
    { title: 'Population Health: Diabetes Cohort', body: '2 of your diabetic patients are overdue for HbA1c testing. Automated reminders sent — awaiting confirmation.', color: 'bg-teal-950/60 border-teal-500/20', badge: 'Monitoring', badgeColor: 'bg-teal-500/20 text-teal-300' },
    { title: 'Prescription Expiry Alert', body: 'Sara Patel\'s Metformin prescription expires in 5 days. Renewal recommended during today\'s checkup visit.', color: 'bg-purple-950/60 border-purple-500/20', badge: 'Reminder', badgeColor: 'bg-purple-500/20 text-purple-300' },
  ];
  return (
    <div className="p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-3xl font-bold">AI Insights</h2>
        <p className="text-white/40 text-sm mt-1">Gemini-powered clinical intelligence for your patient panel.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`p-5 rounded-2xl border ${ins.color}`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-semibold text-white/90 leading-snug pr-3">{ins.title}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${ins.badgeColor}`}>{ins.badge}</span>
            </div>
            <p className="text-xs text-white/55 leading-relaxed">{ins.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'queue',    label: 'Patient Queue', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg> },
  { id: 'insights', label: 'AI Insights',   icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg> },
  { id: 'schedule', label: 'Schedule',      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
];

export default function DoctorDashboard() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('queue');
  const name = user?.displayName || 'Doctor';
  const handleLogOut = async () => { await logOut(); navigate('/auth'); };

  const renderContent = () => {
    switch (tab) {
      case 'queue':    return <QueueView />;
      case 'insights': return <InsightsView />;
      case 'schedule': return <ScheduleView />;
      default:         return <QueueView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex" style={{ cursor: 'auto' }}>
      {/* Sidebar */}
      <aside className="w-60 bg-white/[0.03] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-mono text-lg font-bold tracking-tight">CareCore.</h1>
          <p className="text-white/30 text-xs mt-0.5">Physician Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(item => (
            <NavItem key={item.id} {...item} active={tab === item.id} onClick={() => setTab(item.id)} />
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-3">
          <CommandCenterModal />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-xs font-bold">{name[0]}</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-white/30 text-xs">Physician</p>
            </div>
          </div>
          <button onClick={handleLogOut} className="w-full text-left text-xs text-white/30 hover:text-red-400 transition-colors py-1 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <EmailVerificationBanner />
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex-1 flex overflow-hidden">
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
