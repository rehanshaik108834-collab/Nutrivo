import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const NAV = [
  { to: '/', label: 'Today', icon: '◈' },
  { to: '/log', label: 'Log Meal', icon: '⊕' },
  { to: '/analytics', label: 'Analytics', icon: '◎' },
  { to: '/profile', label: 'Profile', icon: '◉' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, ...(mobileOpen ? styles.sidebarOpen : {}) }}>
        <div style={styles.logo}>
          <div style={styles.logoIconContainer}>
            <span style={styles.logoIcon}>N</span>
          </div>
          <span style={styles.logoText}>nutrivo</span>
        </div>

        <nav style={styles.nav}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}>
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {item.to === '/log' && <span style={styles.logBadge}>+</span>}
            </NavLink>
          ))}
        </nav>

        <div style={styles.bottomSection}>
          <button onClick={toggleTheme} style={styles.themeToggle}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>

          <div style={styles.userSection}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">↗</button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div style={styles.overlay} onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.mobileHeader}>
          <button style={styles.menuBtn} onClick={() => setMobileOpen(true)}>☰</button>
          <span style={styles.mobileLogo}>nutrivo</span>
          <button onClick={toggleTheme} style={styles.mobileThemeBtn}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    width: 260, minHeight: '100vh', background: 'var(--surface2)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '32px 20px',
    position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '@media(max-width:768px)': { position: 'fixed' }
  },
  sidebarOpen: {
    position: 'fixed', left: 0, top: 0, zIndex: 1000, transform: 'translateX(0)',
    boxShadow: 'var(--shadow-lg)'
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, padding: '0 8px' },
  logoIconContainer: {
    background: 'linear-gradient(135deg, var(--lime), var(--teal))',
    padding: '2px', borderRadius: 12,
  },
  logoIcon: {
    width: 34, height: 34, background: 'var(--surface)', color: 'var(--text)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, flexShrink: 0
  },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text)' },
  nav: { display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
    borderRadius: 12, color: 'var(--text2)', textDecoration: 'none',
    fontSize: 15, fontWeight: 600, transition: 'all 0.2s', position: 'relative'
  },
  navActive: {
    background: 'var(--lime-glow)', color: 'var(--lime-dim)', fontWeight: 700,
    boxShadow: 'inset 4px 0 0 var(--lime)'
  },
  navIcon: { fontSize: 20, width: 24, textAlign: 'center' },
  navLabel: {},
  logBadge: {
    marginLeft: 'auto', width: 22, height: 22, background: 'linear-gradient(135deg, var(--lime), var(--lime-dim))', color: '#fff',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 800, lineHeight: 1, boxShadow: '0 2px 8px var(--lime-glow)'
  },
  bottomSection: {
    display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24
  },
  themeToggle: {
    width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--border2)',
    background: 'var(--bg)', color: 'var(--text2)', fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'var(--font-body)', fontSize: 14
  },
  userSection: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 12px',
    background: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border)',
  },
  avatar: {
    width: 38, height: 38, background: 'linear-gradient(135deg, var(--purple), var(--pink))',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0, boxShadow: '0 4px 12px rgba(236,72,153,0.3)'
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: { fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: {
    background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
    fontSize: 18, padding: 4, transition: 'color 0.2s', borderRadius: 8
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  mobileHeader: {
    display: 'none', padding: '16px 20px', background: 'var(--surface)',
    borderBottom: '1px solid var(--border)', alignItems: 'center', gap: 16,
    position: 'sticky', top: 0, zIndex: 10
  },
  menuBtn: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 20, cursor: 'pointer', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mobileLogo: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text)', flex: 1 },
  mobileThemeBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' },
  content: { flex: 1, padding: '40px', overflowY: 'auto', maxWidth: '100%' }
};
