import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, BarChart3, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/log', label: 'Log Meal', icon: PlusCircle, highlight: true },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col py-8 px-5 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.05)] transform transition-transform duration-300 md:translate-x-0 md:static md:z-auto md:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-12">
          <div className="bg-slate-900 text-white w-9 h-9 rounded-[14px] flex items-center justify-center font-display font-extrabold text-lg shadow-sm">N</div>
          <span className="font-display font-extrabold text-2xl text-slate-800 tracking-tight">nutrivo</span>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {NAV.map(({ to, label, icon: Icon, highlight }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 
                ${isActive
                  ? 'bg-pastel-blue text-blue-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }
                ${highlight && !isActive ? 'border border-dashed border-slate-200' : ''}
              `}
            >
              <Icon className={`w-5 h-5 ${highlight ? 'text-blue-500' : ''}`} />
              {label}
              {highlight && (
                <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">+</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-bold text-slate-800 truncate">{user?.name}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-extrabold text-xl text-slate-800">nutrivo</span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
