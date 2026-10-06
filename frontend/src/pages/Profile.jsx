import { useState } from 'react';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';
import {
  User, Target, Shield, CheckCircle, Loader2,
  Flame, Beef, Wheat, Droplets, Salad, Eye, EyeOff, Mail, Lock
} from 'lucide-react';

/* ─── Small reusable text input ─── */
function Field({ label, type = 'text', value, onChange, placeholder, rightEl, error }) {
  return (
    <div>
      <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-slate-50 rounded-2xl px-5 py-3.5 font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 border transition-all pr-${rightEl ? '12' : '5'} ${error ? 'border-red-300 focus:ring-red-100' : 'border-transparent focus:border-blue-200'}`}
        />
        {rightEl && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightEl}</div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-semibold mt-1.5 pl-1">{error}</p>}
    </div>
  );
}

/* ─── Password Field with show/hide ─── */
function PasswordField({ label, value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      rightEl={
        <button type="button" onClick={() => setShow(s => !s)} className="text-slate-400 hover:text-slate-600 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}

/* ─── Status Banner ─── */
function StatusBanner({ success, error }) {
  if (!success && !error) return null;
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
      {success ? <CheckCircle className="w-4 h-4" /> : <span>⚠️</span>}
      {success || error}
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('goals');

  // ── Goals state ──
  const [goals, setGoals] = useState(user?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30, water: 2500 });
  const [goalsSaving, setGoalsSaving] = useState(false);
  const [goalsStatus, setGoalsStatus] = useState({ success: '', error: '' });

  // ── Personal Details state ──
  const [name, setName] = useState(user?.name || '');
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsStatus, setDetailsStatus] = useState({ success: '', error: '' });

  // ── Account state ──
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ success: '', error: '' });

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState({ success: '', error: '' });
  const [pwErrors, setPwErrors] = useState({});

  // ── Handlers ──
  const saveGoals = async () => {
    setGoalsSaving(true);
    setGoalsStatus({ success: '', error: '' });
    try {
      const { data } = await axios.patch(`${API}/users/goals`, goals);
      updateUser(data.user);
      setGoalsStatus({ success: 'Goals saved successfully!', error: '' });
      setTimeout(() => setGoalsStatus({ success: '', error: '' }), 3000);
    } catch (err) {
      setGoalsStatus({ success: '', error: err?.response?.data?.message || 'Failed to save goals' });
    } finally { setGoalsSaving(false); }
  };

  const saveDetails = async () => {
    setDetailsSaving(true);
    setDetailsStatus({ success: '', error: '' });
    try {
      const { data } = await axios.patch(`${API}/users/profile`, { name });
      updateUser(data.user);
      setDetailsStatus({ success: 'Name updated!', error: '' });
      setTimeout(() => setDetailsStatus({ success: '', error: '' }), 3000);
    } catch (err) {
      setDetailsStatus({ success: '', error: err?.response?.data?.message || 'Failed to update' });
    } finally { setDetailsSaving(false); }
  };

  const saveEmail = async () => {
    setEmailSaving(true);
    setEmailStatus({ success: '', error: '' });
    try {
      const { data } = await axios.patch(`${API}/users/email`, { email: newEmail });
      updateUser(data.user);
      setEmailStatus({ success: 'Email updated successfully!', error: '' });
      setTimeout(() => setEmailStatus({ success: '', error: '' }), 3000);
    } catch (err) {
      setEmailStatus({ success: '', error: err?.response?.data?.message || 'Failed to update email' });
    } finally { setEmailSaving(false); }
  };

  const savePassword = async () => {
    const errors = {};
    if (!currentPw) errors.currentPw = 'Required';
    if (!newPw) errors.newPw = 'Required';
    else if (newPw.length < 6) errors.newPw = 'At least 6 characters';
    if (newPw !== confirmPw) errors.confirmPw = 'Passwords do not match';
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwSaving(true);
    setPwStatus({ success: '', error: '' });
    try {
      await axios.patch(`${API}/users/password`, { currentPassword: currentPw, newPassword: newPw });
      setPwStatus({ success: 'Password changed successfully!', error: '' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwStatus({ success: '', error: '' }), 3000);
    } catch (err) {
      setPwStatus({ success: '', error: err?.response?.data?.message || 'Failed to change password' });
    } finally { setPwSaving(false); }
  };

  const goalFields = [
    { key: 'calories', label: 'Daily Calories',    unit: 'kcal', min: 1000, max: 5000, step: 50,  icon: Flame,    color: '#fbbf24' },
    { key: 'protein',  label: 'Protein Goal',      unit: 'g',    min: 10,   max: 300,  step: 5,   icon: Beef,     color: '#a78bfa' },
    { key: 'carbs',    label: 'Carbs Goal',         unit: 'g',    min: 10,   max: 600,  step: 5,   icon: Wheat,    color: '#60a5fa' },
    { key: 'fat',      label: 'Fat Goal',           unit: 'g',    min: 10,   max: 200,  step: 5,   icon: Droplets, color: '#f472b6' },
    { key: 'fiber',    label: 'Fiber Goal',         unit: 'g',    min: 5,    max: 100,  step: 5,   icon: Salad,    color: '#34d399' },
    { key: 'water',    label: 'Daily Water Goal',   unit: 'ml',   min: 500,  max: 5000, step: 100, icon: Droplets, color: '#38bdf8' },
  ];

  const tabs = [
    { id: 'goals',   label: 'Goals',   icon: Target  },
    { id: 'details', label: 'Details', icon: User    },
    { id: 'account', label: 'Account', icon: Shield  },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-[fadeInUp_0.5s_ease-out_both]">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Profile</h1>
        <p className="text-slate-500 font-medium">Manage your goals and account settings.</p>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100 mb-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-display font-extrabold text-3xl shadow-md flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div className="font-display font-extrabold text-2xl text-slate-800">{user?.name}</div>
          <div className="text-slate-400 font-medium">{user?.email}</div>
          {user?.streak > 0 && (
            <div className="flex items-center gap-2 mt-2 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1.5 rounded-full w-fit">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">{user.streak} day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Goals Tab ── */}
      {tab === 'goals' && (
        <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
          <h2 className="font-display font-bold text-xl text-slate-800 mb-6">Daily Nutrition Goals</h2>
          <div className="flex flex-col gap-6">
            {goalFields.map(({ key, label, unit, min, max, step, icon: Icon, color }) => (
              <div key={key} className="bg-slate-50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <span className="font-bold text-slate-700">{label}</span>
                  </div>
                  <span className="font-display font-extrabold text-2xl text-slate-800">
                    {key === 'water' && goals[key] >= 1000
                      ? `${(goals[key] / 1000).toFixed(1)}L`
                      : goals[key]}{' '}
                    <span className="text-sm text-slate-400 font-semibold">{key === 'water' && goals[key] >= 1000 ? '' : unit}</span>
                  </span>
                </div>
                <input type="range" min={min} max={max} step={step} value={goals[key] || min}
                  onChange={e => setGoals({ ...goals, [key]: +e.target.value })}
                  className="w-full h-2 rounded-full cursor-pointer appearance-none bg-slate-200"
                  style={{ accentColor: color }} />
                <div className="flex justify-between text-xs text-slate-400 font-semibold mt-2">
                  <span>{key === 'water' ? `${min}ml` : `${min}${unit}`}</span>
                  <span>{key === 'water' ? `${max / 1000}L` : `${max}${unit}`}</span>
                </div>
              </div>
            ))}
          </div>
          <StatusBanner success={goalsStatus.success} error={goalsStatus.error} />
          <button onClick={saveGoals} disabled={goalsSaving}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold shadow hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
            {goalsSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Goals'}
          </button>
        </div>
      )}

      {/* ── Personal Details Tab ── */}
      {tab === 'details' && (
        <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
          <h2 className="font-display font-bold text-xl text-slate-800 mb-6">Personal Details</h2>
          <div className="flex flex-col gap-5">
            <Field
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Alex Johnson"
            />
          </div>
          <StatusBanner success={detailsStatus.success} error={detailsStatus.error} />
          <button onClick={saveDetails} disabled={detailsSaving}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold shadow hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
            {detailsSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Details'}
          </button>
        </div>
      )}

      {/* ── Account Tab ── */}
      {tab === 'account' && (
        <div className="flex flex-col gap-5">

          {/* Change Email */}
          <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="font-display font-bold text-xl text-slate-800">Change Email</h2>
            </div>
            <div className="flex flex-col gap-4">
              <Field
                label="New Email Address"
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <StatusBanner success={emailStatus.success} error={emailStatus.error} />
            <button onClick={saveEmail} disabled={emailSaving || newEmail === user?.email}
              className="w-full mt-5 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold shadow hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40">
              {emailSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Email'}
            </button>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-500" />
              </div>
              <h2 className="font-display font-bold text-xl text-slate-800">Change Password</h2>
            </div>
            <div className="flex flex-col gap-4">
              <PasswordField
                label="Current Password"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                error={pwErrors.currentPw}
              />
              <PasswordField
                label="New Password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="At least 6 characters"
                error={pwErrors.newPw}
              />
              <PasswordField
                label="Confirm New Password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                error={pwErrors.confirmPw}
              />
            </div>
            <StatusBanner success={pwStatus.success} error={pwStatus.error} />
            <button onClick={savePassword} disabled={pwSaving}
              className="w-full mt-5 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold shadow hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
              {pwSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
