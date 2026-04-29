// src/components/EmailVerificationBanner.jsx
import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';

export default function EmailVerificationBanner() {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't show if: no user, already verified, or dismissed
  if (!user || user.emailVerified || dismissed) return null;
  // Don't show for Google-signed-in users (they're already verified)
  if (user.providerData?.[0]?.providerId === 'google.com') return null;

  const resend = async () => {
    setLoading(true);
    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch (err) {
      console.warn('Resend failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
      style={{
        background: 'linear-gradient(90deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))',
        borderBottom: '1px solid rgba(239,68,68,0.2)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon */}
        <div className="w-6 h-6 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-[#ef4444]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <span className="text-white/70 truncate">
          {sent
            ? '✓ Verification email resent — check your inbox and spam folder'
            : `Please verify your email (${user.email}). Check your spam folder if you don't see it.`
          }
        </span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {!sent && (
          <button
            onClick={resend}
            disabled={loading}
            className="text-xs font-semibold text-[#ef4444] hover:text-[#ef4444]/80 transition-colors disabled:opacity-50 whitespace-nowrap border border-[#ef4444]/30 px-3 py-1 rounded-lg"
          >
            {loading ? 'Sending…' : 'Resend email'}
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-white/20 hover:text-white/50 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
