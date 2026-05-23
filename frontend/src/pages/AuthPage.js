import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin, signup } = useAuth();

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') await signup(form.name, form.email, form.password);
      else await signin(form.email, form.password);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      {/* Dynamic Background */}
      <div style={s.bgWrap}>
        <div style={{...s.bgOrb, ...s.orbTopLeft}} />
        <div style={{...s.bgOrb, ...s.orbBottomRight}} />
      </div>

      {/* Main Content */}
      <div style={s.container}>
        {/* Left panel */}
        <div style={s.left}>
          <div style={s.logo}>
            <div style={s.logoIconContainer}>
              <span style={s.logoIcon}>N</span>
            </div>
            <span style={s.logoText}>nutrivo</span>
          </div>
          <h1 style={s.headline}>Track nutrition <br /><span className="gradient-text">effortlessly.</span></h1>
          <p style={s.sub}>Snap a photo of your meal. Our AI does the rest — calories, protein, macros, all of it in seconds.</p>
          <div style={s.features}>
            {[
              ['📸', 'AI-Powered Analysis', 'Photo-based meal recognition'],
              ['📊', 'Smart Analytics', 'Weekly & monthly insights'],
              ['🔥', 'Daily Streaks', 'Stay consistent, see results'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={s.feature}>
                <div style={s.featureIconWrap}>{icon}</div>
                <div>
                  <div style={s.featureTitle}>{title}</div>
                  <div style={s.featureDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel (Form) */}
        <div style={s.right}>
          <div className="glass-panel" style={s.formWrapper}>
            <div style={s.form}>
              <h2 style={s.formTitle}>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
              <p style={s.formSub}>{mode === 'signin' ? 'Sign in to continue tracking' : 'Start your nutrition journey'}</p>

              <form onSubmit={handle} style={s.fields}>
                {mode === 'signup' && (
                  <div style={s.field}>
                    <label style={s.label}>Full Name</label>
                    <input className="input" placeholder="Alex Johnson" value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                )}
                <div style={s.field}>
                  <label style={s.label}>Email</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Password</label>
                  <input className="input" type="password" placeholder="••••••••" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})} required />
                </div>

                {error && <div style={s.error}>{error}</div>}

                <button className="btn btn-lime" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 12 }}>
                  {loading ? <span className="spinner" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div style={s.toggle}>
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button style={s.toggleBtn} type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex' },
  bgWrap: { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 },
  bgOrb: { position: 'absolute', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.4 },
  orbTopLeft: { width: '50vw', height: '50vw', background: 'var(--lime)', top: '-20%', left: '-10%' },
  orbBottomRight: { width: '40vw', height: '40vw', background: 'var(--teal)', bottom: '-10%', right: '-10%' },
  container: { display: 'flex', width: '100%', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1, padding: '40px' },
  left: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '60px' },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 },
  logoIconContainer: { background: 'linear-gradient(135deg, var(--lime), var(--teal))', padding: '2px', borderRadius: 12 },
  logoIcon: {
    width: 38, height: 38, background: 'var(--surface)', color: 'var(--text)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20
  },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text)' },
  headline: { fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 800, lineHeight: 1.1, color: 'var(--text)', marginBottom: 24 },
  sub: { color: 'var(--text2)', fontSize: 18, lineHeight: 1.6, marginBottom: 48, maxWidth: 480 },
  features: { display: 'flex', flexDirection: 'column', gap: 24 },
  feature: { display: 'flex', alignItems: 'center', gap: 20 },
  featureIconWrap: { 
    width: 48, height: 48, borderRadius: 14, background: 'var(--surface)', 
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
    boxShadow: 'var(--shadow-sm)'
  },
  featureTitle: { color: 'var(--text)', fontWeight: 700, fontSize: 16 },
  featureDesc: { color: 'var(--text3)', fontSize: 14, marginTop: 4 },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' },
  formWrapper: { width: '100%', maxWidth: 440, padding: '48px', animation: 'fadeUp 0.5s ease' },
  form: { display: 'flex', flexDirection: 'column' },
  formTitle: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 8 },
  formSub: { color: 'var(--text2)', fontSize: 15, marginBottom: 36 },
  fields: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: 'var(--text2)' },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: 'var(--coral)', padding: '14px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500
  },
  toggle: { textAlign: 'center', marginTop: 32, color: 'var(--text3)', fontSize: 15 },
  toggleBtn: { background: 'none', border: 'none', color: 'var(--lime-dim)', cursor: 'pointer', fontWeight: 700, fontSize: 15, transition: 'color 0.2s' }
};
