import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommandCenterModal from '../components/CommandCenterModal';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import CalendarPlanner from '../components/CalendarPlanner';
import MedicalRecords from '../components/MedicalRecords';

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',       icon: '⊞' },
  { id: 'timeline',     label: 'Timeline',        icon: '⚡' },
  { id: 'appointments', label: 'Appointments',    icon: '📅' },
  { id: 'records',      label: 'Medical Records', icon: '📋' },
  { id: 'messages',     label: 'Messages',        icon: '💬' },
];

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
    }`}
  >
    <span className="text-base">{icon}</span>
    {label}
  </button>
);

const timelineEvents = [
  { date: 'Jan 2022', title: 'Type 2 Diabetes Diagnosed',   type: 'diagnosis', color: 'bg-red-500',    icon: '🩺', detail: 'HbA1c: 8.1%. Started Metformin 500mg twice daily.' },
  { date: 'Mar 2022', title: 'Metformin Dosage Adjusted',   type: 'medication',color: 'bg-purple-500', icon: '💊', detail: 'Increased to 1000mg. Blood glucose stabilising at 110–130 mg/dL.' },
  { date: 'Jun 2022', title: 'Annual Physical — Clear',     type: 'checkup',   color: 'bg-green-500',  icon: '✅', detail: 'BP: 118/76. Weight: 82kg. Cholesterol in normal range.' },
  { date: 'Nov 2022', title: 'HbA1c: 7.2%',                type: 'lab',       color: 'bg-blue-500',   icon: '🧪', detail: 'Significant improvement. Continue current medication plan.' },
  { date: 'Feb 2023', title: 'Ophthalmology Screening',     type: 'checkup',   color: 'bg-teal-500',   icon: '👁️', detail: 'No diabetic retinopathy detected. Next screening: Feb 2024.' },
  { date: 'Oct 2023', title: 'HbA1c: 6.9% — Near Target',  type: 'lab',       color: 'bg-green-500',  icon: '🧪', detail: 'Near-target. Continue Metformin. Dietary consultation completed.' },
  { date: 'Apr 2024', title: 'Annual Physical',             type: 'checkup',   color: 'bg-green-500',  icon: '✅', detail: 'BP: 120/80. All vitals stable. Prescription renewed for 12 months.' },
];

function TimelineView() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Medical Timeline</h2>
        <p className="text-white/40 mt-1 text-sm">Your complete health journey at a glance.</p>
      </div>
      <div className="relative">
        <div className="absolute left-[10px] top-0 bottom-0 w-px bg-white/10" />
        <div className="space-y-4 pl-10">
          {timelineEvents.map((ev, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative">
              <div className={`absolute -left-[34px] top-4 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${ev.color}`} />
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className={`w-full text-left rounded-2xl border px-5 py-4 transition-all duration-200 ${expanded === i ? 'border-white/20 bg-white/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ev.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{ev.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs text-white/30">{ev.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{ev.type}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-white/30 text-xs mt-1">{expanded === i ? '▲' : '▼'}</span>
                </div>
              </button>
              <AnimatePresence initial={false}>
                {expanded === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="mt-2 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-4">
                      <p className="text-sm text-white/60 leading-relaxed">{ev.detail}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OverviewView({ name }) {
  const vitals = [
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', color: 'bg-red-950/60 text-red-200',      delay: 0.1 },
    { label: 'Heart Rate',     value: '72',     unit: 'bpm',  color: 'bg-blue-950/60 text-blue-200',    delay: 0.15 },
    { label: 'Blood Glucose',  value: '94',     unit: 'mg/dL',color: 'bg-amber-950/60 text-amber-200',  delay: 0.2 },
    { label: 'Temperature',    value: '98.6',   unit: '°F',   color: 'bg-emerald-950/60 text-emerald-200', delay: 0.25 },
  ];
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-3xl font-bold">Good morning, {name} 👋</h2>
        <p className="text-white/40 mt-1 text-sm">Here's your health snapshot for today.</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {vitals.map((v, i) => (
          <motion.div key={v.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: v.delay }} className={`rounded-2xl p-5 ${v.color}`}>
            <p className="text-xs font-medium opacity-70 mb-1">{v.label}</p>
            <p className="text-2xl font-bold">{v.value} <span className="text-sm font-normal opacity-60">{v.unit}</span></p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-1 bg-white/[0.04] border border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-sm text-white/70">Next Appointment</h3>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">Tomorrow</span>
          </div>
          <p className="text-xl font-bold mb-1">Dr. Sarah Jenkins</p>
          <p className="text-white/40 text-sm mb-4">General Checkup · 10:00 AM</p>
          <div className="h-px bg-white/5 mb-4" />
          <button className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-all">Reschedule</button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="col-span-1 md:col-span-2 bg-white/[0.04] border border-white/5 rounded-3xl p-6">
          <h3 className="font-semibold text-sm text-white/70 mb-5">Action Items</h3>
          <div className="space-y-3">
            {[
              { icon: '🧪', label: 'Lab Results Ready',         sub: 'Comprehensive Metabolic Panel — Oct 24', color: 'text-yellow-300', bg: 'bg-yellow-400/10 border-yellow-400/20' },
              { icon: '💊', label: 'Prescription Renewal Due',  sub: 'Metformin 500mg — expires in 5 days',    color: 'text-red-300',    bg: 'bg-red-400/10 border-red-400/20' },
              { icon: '📋', label: 'Fill Annual Health Survey', sub: 'Takes ~3 minutes',                       color: 'text-blue-300',   bg: 'bg-blue-400/10 border-blue-400/20' },
            ].map(item => (
              <div key={item.label} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${item.bg}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className={`text-sm font-medium ${item.color}`}>{item.label}</p>
                    <p className="text-xs text-white/30">{item.sub}</p>
                  </div>
                </div>
                <button className="text-xs text-white/40 hover:text-white transition-colors">View →</button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PlaceholderView({ title, icon }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-white/30 text-sm">This section is coming soon.</p>
    </motion.div>
  );
}

export default function PatientDashboard() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const name = user?.displayName?.split(' ')[0] || 'Patient';
  const handleLogOut = async () => { await logOut(); navigate('/auth'); };

  const renderContent = () => {
    switch (tab) {
      case 'overview':     return <OverviewView name={name} />;
      case 'timeline':     return <TimelineView />;
      case 'appointments': return (
        <div>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-3xl font-bold">Appointments 📅</h2>
            <p className="text-white/40 mt-1 text-sm">View and manage your upcoming medical appointments.</p>
          </motion.div>
          <CalendarPlanner />
        </div>
      );
      case 'records': return (
        <div>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-3xl font-bold">Medical Records 📋</h2>
            <p className="text-white/40 mt-1 text-sm">Upload, manage, and download your medical documents securely.</p>
          </motion.div>
          <MedicalRecords />
        </div>
      );
      case 'messages':     return <PlaceholderView title="Messages" icon="💬" />;
      default:             return <OverviewView name={name} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex" style={{ cursor: 'auto' }}>
      <aside className="w-60 bg-white/[0.03] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-mono text-lg font-bold tracking-tight">CareCore.</h1>
          <p className="text-white/30 text-xs mt-0.5">Patient Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavItem key={item.id} {...item} active={tab === item.id} onClick={() => setTab(item.id)} />
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-3">
          <CommandCenterModal />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold">{name[0]}</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName || 'Patient'}</p>
              <p className="text-white/30 text-xs">Patient</p>
            </div>
          </div>
          <button onClick={handleLogOut} className="w-full text-left text-xs text-white/30 hover:text-red-400 transition-colors py-1 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto flex flex-col">
        <EmailVerificationBanner />
        <div className="p-8 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
