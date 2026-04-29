// src/pages/AuthPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Sparkles } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { signIn, signUp, signInWithGoogle } from '../lib/firebase';

// ── Pupil (no white ball) ─────────────────────────────────────────────────────
function Pupil({ size = 12, maxDistance = 5, pupilColor = '#2D2D2D', forceLookX, forceLookY }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  const pos = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };
  const p = pos();
  return (
    <div ref={ref} className="rounded-full" style={{
      width: size, height: size, backgroundColor: pupilColor,
      transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform 0.1s ease-out',
    }} />
  );
}

// ── EyeBall (with white sclera) ───────────────────────────────────────────────
function EyeBall({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white', pupilColor = '#2D2D2D', isBlinking = false, forceLookX, forceLookY }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  const pos = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };
  const p = pos();
  return (
    <div ref={ref} className="rounded-full flex items-center justify-center transition-all duration-150" style={{
      width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, overflow: 'hidden',
    }}>
      {!isBlinking && (
        <div className="rounded-full" style={{
          width: pupilSize, height: pupilSize, backgroundColor: pupilColor,
          transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform 0.1s ease-out',
        }} />
      )}
    </div>
  );
}

// ── Animated Characters Panel ─────────────────────────────────────────────────
function CharactersPanel({ isTypingPassword, showPassword }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [purpleBlink, setPurpleBlink] = useState(false);
  const [blackBlink, setBlackBlink] = useState(false);
  const [lookingAtEachOther, setLookingAtEachOther] = useState(false);
  const [purplePeeking, setPurplePeeking] = useState(false);
  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);

  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  // Blinking
  useEffect(() => {
    const scheduleBlink = (setter) => {
      const t = setTimeout(() => {
        setter(true);
        setTimeout(() => { setter(false); scheduleBlink(setter); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t1 = scheduleBlink(setPurpleBlink);
    const t2 = scheduleBlink(setBlackBlink);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Look-at-each-other when typing
  useEffect(() => {
    if (isTypingPassword) {
      setLookingAtEachOther(true);
      const t = setTimeout(() => setLookingAtEachOther(false), 800);
      return () => clearTimeout(t);
    }
  }, [isTypingPassword]);

  // Purple peeking when password visible
  useEffect(() => {
    if (showPassword) {
      const t = setTimeout(() => {
        setPurplePeeking(true);
        setTimeout(() => setPurplePeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    }
  }, [showPassword, purplePeeking]);

  const calcPos = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 3);
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const pp = calcPos(purpleRef);
  const bp = calcPos(blackRef);
  const yp = calcPos(yellowRef);
  const op = calcPos(orangeRef);
  const hiding = isTypingPassword && !showPassword;

  return (
    <div className="relative" style={{ width: 550, height: 400 }}>
      {/* Purple — back */}
      <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{
        left: 70, width: 180,
        height: hiding ? 440 : 400,
        backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1,
        transform: showPassword ? 'skewX(0deg)' : hiding
          ? `skewX(${pp.bodySkew - 12}deg) translateX(40px)`
          : `skewX(${pp.bodySkew}deg)`,
        transformOrigin: 'bottom center',
      }}>
        <div className="absolute flex gap-8 transition-all duration-700 ease-in-out" style={{
          left: showPassword ? 20 : lookingAtEachOther ? 55 : 45 + pp.faceX,
          top:  showPassword ? 35 : lookingAtEachOther ? 65 : 40 + pp.faceY,
        }}>
          {[0,1].map(i => <EyeBall key={i} size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={purpleBlink}
            forceLookX={showPassword ? (purplePeeking ? 4 : -4) : lookingAtEachOther ? 3 : undefined}
            forceLookY={showPassword ? (purplePeeking ? 5 : -4) : lookingAtEachOther ? 4 : undefined} />)}
        </div>
      </div>

      {/* Black — middle */}
      <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{
        left: 240, width: 120, height: 310,
        backgroundColor: '#2D2D2D', borderRadius: '8px 8px 0 0', zIndex: 2,
        transform: showPassword ? 'skewX(0deg)' : lookingAtEachOther
          ? `skewX(${bp.bodySkew * 1.5 + 10}deg) translateX(20px)`
          : `skewX(${hiding ? bp.bodySkew * 1.5 : bp.bodySkew}deg)`,
        transformOrigin: 'bottom center',
      }}>
        <div className="absolute flex gap-6 transition-all duration-700 ease-in-out" style={{
          left: showPassword ? 10 : lookingAtEachOther ? 32 : 26 + bp.faceX,
          top:  showPassword ? 28 : lookingAtEachOther ? 12 : 32 + bp.faceY,
        }}>
          {[0,1].map(i => <EyeBall key={i} size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={blackBlink}
            forceLookX={showPassword ? -4 : lookingAtEachOther ? 0 : undefined}
            forceLookY={showPassword ? -4 : lookingAtEachOther ? -4 : undefined} />)}
        </div>
      </div>

      {/* Orange — front left */}
      <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{
        left: 0, width: 240, height: 200,
        backgroundColor: '#FF9B6B', borderRadius: '120px 120px 0 0', zIndex: 3,
        transform: showPassword ? 'skewX(0deg)' : `skewX(${op.bodySkew}deg)`,
        transformOrigin: 'bottom center',
      }}>
        <div className="absolute flex gap-8 transition-all duration-200 ease-out" style={{
          left: showPassword ? 50 : 82 + op.faceX,
          top:  showPassword ? 85 : 90 + op.faceY,
        }}>
          {[0,1].map(i => <Pupil key={i} size={12} pupilColor="#2D2D2D"
            forceLookX={showPassword ? -5 : undefined} forceLookY={showPassword ? -4 : undefined} />)}
        </div>
      </div>

      {/* Yellow — front right */}
      <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{
        left: 310, width: 140, height: 230,
        backgroundColor: '#E8D754', borderRadius: '70px 70px 0 0', zIndex: 4,
        transform: showPassword ? 'skewX(0deg)' : `skewX(${yp.bodySkew}deg)`,
        transformOrigin: 'bottom center',
      }}>
        <div className="absolute flex gap-6 transition-all duration-200 ease-out" style={{
          left: showPassword ? 20 : 52 + yp.faceX,
          top:  showPassword ? 35 : 40 + yp.faceY,
        }}>
          {[0,1].map(i => <Pupil key={i} size={12} pupilColor="#2D2D2D"
            forceLookX={showPassword ? -5 : undefined} forceLookY={showPassword ? -4 : undefined} />)}
        </div>
        <div className="absolute w-20 h-1 bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out" style={{
          left: showPassword ? 10 : 40 + yp.faceX,
          top:  showPassword ? 88 : 88 + yp.faceY,
        }} />
      </div>
    </div>
  );
}

// ── Role Pill Selector ────────────────────────────────────────────────────────
const ROLES = ['patient', 'doctor', 'nurse'];
function RoleSelect({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {ROLES.map(r => (
        <button key={r} type="button" onClick={() => onChange(r)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
            value === r
              ? 'bg-[#ef4444] text-white border-[#ef4444]'
              : 'bg-transparent text-[#1F2937]/60 border-[#1F2937]/20 hover:border-[#ef4444]/50'
          }`}>
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ── Auth Page ─────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Extra signup fields
  const [specialization, setSpecialization] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [ward, setWard] = useState('');
  const [shift, setShift] = useState('Morning');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { role: userRole } = await signIn({ email, password });
        navigate(`/dashboard/${userRole || role}`);
      } else {
        const extraData = {};
        if (role === 'doctor') { extraData.specialization = specialization; extraData.licenseId = licenseId; }
        if (role === 'nurse')  { extraData.ward = ward; extraData.shift = shift; }
        await signUp({ email, password, displayName: name, role, extraData });
        setVerificationSent(true); // Show banner
        navigate(`/dashboard/${role}`);
      }
    } catch (err) {
      const msgs = {
        'auth/user-not-found':       'No account found with this email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password':        'Password must be at least 6 characters.',
        'auth/invalid-credential':   'Invalid email or password.',
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
        'auth/popup-blocked':        'Popup was blocked. Please allow popups for this site.',
      };
      setError(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const { role: userRole } = await signInWithGoogle({ role });
      navigate(`/dashboard/${userRole || role}`);
    } catch (err) {
      const msgs = {
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
        'auth/popup-blocked':        'Popup was blocked. Please allow popups for this site.',
        'auth/operation-not-allowed':'Google sign-in is not enabled. Enable it in the Firebase Console → Authentication → Sign-in method.',
      };
      setError(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'h-11 bg-white border-[#1F2937]/20 text-[#1F2937] placeholder:text-[#1F2937]/30 focus:border-[#ef4444] focus:ring-[#ef4444]/20 rounded-lg';

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ cursor: 'auto' }}>

      {/* ── Left: Animated Characters ── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d1460 50%, #1a0a2e 100%)' }}>

        {/* Logo */}
        <div className="relative z-20 flex items-center gap-2 text-lg font-semibold text-white">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-mono font-bold">CareCore.</span>
        </div>

        {/* Characters */}
        <div className="relative z-20 flex items-end justify-center" style={{ height: 500 }}>
          <CharactersPanel isTypingPassword={isTypingPassword} showPassword={showPassword} />
        </div>

        {/* Footer links */}
        <div className="relative z-20 flex items-center gap-8 text-sm text-white/40">
          {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
            <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>

        {/* Decorative blurs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl" />
      </div>

      {/* ── Right: Form ── */}
      <div className="flex items-center justify-center p-8" style={{ backgroundColor: '#FDFCF8' }}>
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#ef4444]" />
            </div>
            <span className="font-mono font-bold text-[#1F2937]">CareCore.</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#1F2937] mb-2">
              {mode === 'login' ? 'Welcome back!' : 'Create account'}
            </h1>
            <p className="text-[#1F2937]/50 text-sm">
              {mode === 'login' ? 'Please enter your details' : 'Join CareCore today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector — always shown */}
            <div className="space-y-1.5">
              <Label className="text-[#1F2937] text-xs font-semibold uppercase tracking-wider">Role</Label>
              <RoleSelect value={role} onChange={setRole} />
            </div>

            {/* Name — signup only */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[#1F2937]">Full Name</Label>
                <Input id="name" placeholder="Alex Johnson" value={name}
                  onChange={e => setName(e.target.value)} required className={inputCls} />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#1F2937]">Email</Label>
              <Input id="email" type="email" placeholder="you@hospital.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setIsTypingPassword(true)}
                onBlur={() => setIsTypingPassword(false)}
                required className={inputCls} />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#1F2937]">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setIsTypingPassword(true)}
                  onBlur={() => setIsTypingPassword(false)}
                  required className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F2937]/40 hover:text-[#1F2937] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Doctor extra fields */}
            {mode === 'signup' && role === 'doctor' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="spec" className="text-[#1F2937]">Specialization</Label>
                  <Input id="spec" placeholder="e.g. Cardiology" value={specialization}
                    onChange={e => setSpecialization(e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lic" className="text-[#1F2937]">License ID</Label>
                  <Input id="lic" placeholder="e.g. MED-123456" value={licenseId}
                    onChange={e => setLicenseId(e.target.value)} className={inputCls} />
                </div>
              </>
            )}

            {/* Nurse extra fields */}
            {mode === 'signup' && role === 'nurse' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="ward" className="text-[#1F2937]">Ward</Label>
                  <Input id="ward" placeholder="e.g. ICU / Paediatrics" value={ward}
                    onChange={e => setWard(e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shift" className="text-[#1F2937]">Shift</Label>
                  <select id="shift" value={shift} onChange={e => setShift(e.target.value)}
                    className="w-full h-11 rounded-lg border border-[#1F2937]/20 bg-white text-[#1F2937] px-3 text-sm outline-none focus:border-[#ef4444]">
                    {['Morning', 'Afternoon', 'Night'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Remember / Forgot */}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
                  <Label htmlFor="remember" className="text-sm text-[#1F2937]/70 font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <a href="#" className="text-sm text-[#ef4444] hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60"
              style={{ backgroundColor: '#ef4444', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
              {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Google */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-11 rounded-lg border border-[#1F2937]/20 bg-white text-[#1F2937] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1F2937]/5 transition-colors disabled:opacity-50"
            >
              {/* Google SVG icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Toggle mode */}
          <p className="text-center text-sm text-[#1F2937]/50 mt-7">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-[#1F2937] font-semibold hover:underline">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
