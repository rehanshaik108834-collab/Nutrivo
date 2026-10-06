import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, BarChart3, Flame, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex relative overflow-hidden font-sans text-slate-800">
      {/* Soft Pastel Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-60 bg-pastel-blue -top-[20%] -left-[10%] animate-float" />
        <div className="absolute w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-60 bg-pastel-green -bottom-[10%] -right-[10%] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-60 bg-pastel-yellow top-[20%] left-[40%] animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-center p-6 md:p-12 lg:p-20 gap-12 lg:gap-24">
        
        {/* Left Side: Brand & Value Props */}
        <div className="flex-1 max-w-xl">
          
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-slate-900 text-white w-12 h-12 rounded-[20px] flex items-center justify-center font-display font-bold text-2xl shadow-sm">
              N
            </div>
            <span className="font-display font-extrabold text-3xl tracking-tight text-slate-900">nutrivo</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.1] text-slate-900 mb-6">
            Meet your new <br/>
            <span className="relative inline-block mt-2">
              <span className="relative z-10">smart diary.</span>
              <span className="absolute bottom-1 left-0 w-full h-4 bg-pastel-green -z-10 rounded-full opacity-80"></span>
            </span>
          </h1>
          
          <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-12">
            No more tedious logging. Snap a photo of your meal and let AI do the heavy lifting instantly.
          </p>
          
          <div className="flex flex-col gap-6">
            {[
              [<Camera className="w-5 h-5 text-slate-700" />, 'Snap & Analyze', 'bg-pastel-blue'],
              [<BarChart3 className="w-5 h-5 text-slate-700" />, 'Track Macros', 'bg-pastel-green'],
              [<Flame className="w-5 h-5 text-slate-700" />, 'Hit Your Goals', 'bg-pastel-yellow'],
            ].map(([icon, title, bgColor], i) => (
              <div key={i} className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-3xl shadow-sm border border-white/40 max-w-md hover:scale-[1.02] transition-transform cursor-default">
                <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center shrink-0`}>
                  {icon}
                </div>
                <div className="font-bold text-lg text-slate-800">{title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
            
            {/* Soft decorative blob inside card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-blue/40 blur-2xl rounded-full -mr-10 -mt-10" />

            <div className="relative z-10">
              <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-2">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-500 mb-8 font-medium">
                {mode === 'signin' ? 'Enter your details to sign in.' : 'Start your journey today.'}
              </p>

              <form onSubmit={handle} className="flex flex-col gap-5">
                {mode === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-pastel-blue transition-all font-medium"
                      placeholder="Alex Johnson" 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})} 
                      required 
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                  <input 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-pastel-blue transition-all font-medium"
                    type="email" 
                    placeholder="you@example.com" 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                  <input 
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-pastel-blue transition-all font-medium"
                    type="password" 
                    placeholder="••••••••" 
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})} 
                    required 
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl text-sm font-semibold mt-2">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-3xl shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-8 text-slate-500 text-sm font-medium">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button 
                  type="button" 
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                  className="font-bold text-slate-900 hover:text-slate-600 transition-colors"
                >
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
