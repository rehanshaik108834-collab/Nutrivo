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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c10] flex relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 bg-lime-500/40 -top-1/4 -left-10 animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-40 bg-teal-500/30 -bottom-10 -right-10 animate-[float_6s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center p-6 md:p-12 lg:p-20">
        
        {/* Left panel */}
        <div className="flex-1 flex flex-col justify-center pr-0 md:pr-16 lg:pr-24 mb-12 md:mb-0">
          <div className="flex items-center gap-3 mb-16 animate-fade-in-up">
            <div className="bg-gradient-to-br from-lime-400 to-teal-500 p-0.5 rounded-xl shadow-lg shadow-lime-500/20">
              <div className="w-10 h-10 bg-white dark:bg-[#17181f] rounded-[10px] flex items-center justify-center font-display font-bold text-xl text-slate-900 dark:text-white">
                N
              </div>
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">nutrivo</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Track nutrition <br />
            <span className="bg-gradient-to-r from-lime-500 to-teal-400 bg-clip-text text-transparent">effortlessly.</span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-12 max-w-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Snap a photo of your meal. Our AI does the rest — calories, protein, macros, all of it in seconds.
          </p>
          
          <div className="flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {[
              ['📸', 'AI-Powered Analysis', 'Photo-based meal recognition'],
              ['📊', 'Smart Analytics', 'Weekly & monthly insights'],
              ['🔥', 'Daily Streaks', 'Stay consistent, see results'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#17181f] border border-slate-200 dark:border-white/5 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 group-hover:border-lime-500/30 group-hover:shadow-lime-500/20 transition-all duration-300">
                  {icon}
                </div>
                <div>
                  <div className="text-slate-900 dark:text-white font-bold text-lg">{title}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel (Form) */}
        <div className="w-full md:w-[440px] flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-white/70 dark:bg-[#17181f]/70 backdrop-blur-2xl border border-white/40 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 rounded-3xl p-8 sm:p-10">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              {mode === 'signin' ? 'Sign in to continue tracking' : 'Start your nutrition journey'}
            </p>

            <form onSubmit={handle} className="flex flex-col gap-5">
              {mode === 'signup' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-[#0b0c10] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 transition-all"
                    placeholder="Alex Johnson" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-[#0b0c10] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 transition-all"
                  type="email" 
                  placeholder="you@example.com" 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} 
                  required 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-[#0b0c10] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 transition-all"
                  type="password" 
                  placeholder="••••••••" 
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required 
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in-up">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 text-white dark:text-slate-950 font-bold text-lg py-4 rounded-xl shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2 flex justify-center items-center h-[56px]"
              >
                {loading ? (
                  <div className="w-6 h-6 border-[3px] border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="text-center mt-8 text-slate-500 dark:text-slate-400 text-sm">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button 
                type="button" 
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                className="font-bold text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
