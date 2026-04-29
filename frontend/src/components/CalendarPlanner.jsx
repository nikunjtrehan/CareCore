// src/components/CalendarPlanner.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Sample appointments keyed by day-of-month
const SAMPLE_APPOINTMENTS = {
  3:  [{ time: '09:00 AM', title: 'Dr. Sharma — Cardiology', type: 'Consultation', room: 'Room 204' }],
  8:  [{ time: '11:30 AM', title: 'Blood Panel & CBC', type: 'Lab Work', room: 'Lab B' }],
  14: [{ time: '02:00 PM', title: 'Dr. Patel — Follow-up', type: 'Follow-up', room: 'Room 110' }, { time: '04:00 PM', title: 'Physiotherapy Session', type: 'Therapy', room: 'PT Wing' }],
  19: [{ time: '10:00 AM', title: 'Annual Physical Exam', type: 'Check-up', room: 'Room 302' }],
  23: [{ time: '03:30 PM', title: 'MRI Scan — Brain', type: 'Imaging', room: 'Radiology' }],
  28: [{ time: '09:30 AM', title: 'Dr. Singh — Endocrinology', type: 'Consultation', room: 'Room 115' }],
};

const typeColor = {
  Consultation: 'bg-blue-500/20 text-blue-300',
  'Lab Work':   'bg-yellow-500/20 text-yellow-300',
  'Follow-up':  'bg-purple-500/20 text-purple-300',
  Therapy:      'bg-green-500/20 text-green-300',
  'Check-up':   'bg-teal-500/20 text-teal-300',
  Imaging:      'bg-orange-500/20 text-orange-300',
};

function CalendarDay({ day, isHeader, isToday, hasAppt, isSelected, onClick }) {
  if (isHeader) {
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <span className="text-[10px] font-semibold text-white/30 tracking-widest">{day}</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150
        ${isSelected ? 'bg-[#ef4444] text-white shadow-lg shadow-red-900/30'
          : isToday ? 'bg-white/15 text-white font-bold'
          : 'text-white/50 hover:bg-white/10 hover:text-white'
        }`}
    >
      <span className="text-sm font-medium">{day}</span>
      {hasAppt && !isSelected && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ef4444]" />
      )}
    </button>
  );
}

export default function CalendarPlanner() {
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const monthName    = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });
  const firstDayOfWk = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayDay     = now.getDate();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const appointments = selectedDay ? (SAMPLE_APPOINTMENTS[selectedDay] || []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Left: Calendar card ── */}
      <div className="lg:col-span-2">
        <div
          className="rounded-3xl border border-white/10 p-5"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">{monthName}</p>
              <p className="text-xs text-white/30">{viewYear}</p>
            </div>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
            {/* Headers */}
            {DAY_NAMES.map(d => <CalendarDay key={d} day={d} isHeader />)}

            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfWk }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <CalendarDay
                  key={day}
                  day={day}
                  isToday={isCurrentMonth && day === todayDay}
                  hasAppt={!!SAMPLE_APPOINTMENTS[day]}
                  isSelected={selectedDay === day}
                  onClick={() => setSelectedDay(day)}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 text-xs text-white/30">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              Appointment
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/20" />
              Today
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Day detail ── */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-1 font-mono">
            {selectedDay
              ? `${monthName} ${selectedDay}, ${viewYear}`
              : 'Select a day'}
          </h3>
          {selectedDay && (
            <p className="text-xs text-white/30">
              {appointments.length === 0
                ? 'No appointments scheduled'
                : `${appointments.length} appointment${appointments.length > 1 ? 's' : ''} scheduled`}
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!selectedDay ? (
            <motion.div
              key="empty-prompt"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="text-5xl mb-4">📅</div>
              <p className="text-white/30 text-sm">Click a date to view your appointments</p>
              <p className="text-white/15 text-xs mt-1">Dates with a red dot have appointments</p>
            </motion.div>
          ) : appointments.length === 0 ? (
            <motion.div
              key="no-appts"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="text-5xl mb-4">✅</div>
              <p className="text-white/40 text-sm font-medium">Clear day</p>
              <p className="text-white/20 text-xs mt-1">No appointments scheduled for this date</p>
            </motion.div>
          ) : (
            <motion.div
              key={`appts-${selectedDay}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {appointments.map((appt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex items-start gap-4 hover:border-white/15 transition-colors"
                >
                  {/* Time pill */}
                  <div className="flex-shrink-0 text-center bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl px-3 py-2">
                    <p className="text-[10px] font-mono text-[#ef4444]/80 uppercase tracking-wider">Time</p>
                    <p className="text-sm font-bold text-[#ef4444]">{appt.time}</p>
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{appt.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{appt.room}</p>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-2 ${typeColor[appt.type] || 'bg-white/10 text-white/50'}`}>
                      {appt.type}
                    </span>
                  </div>
                  {/* Arrow */}
                  <svg className="w-4 h-4 text-white/20 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </motion.div>
              ))}

              {/* Book new */}
              <button className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-white/30 hover:border-white/20 hover:text-white/50 transition-all text-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Request new appointment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
