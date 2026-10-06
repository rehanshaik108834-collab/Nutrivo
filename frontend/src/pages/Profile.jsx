import { useState } from 'react';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';
import { User, Target, CheckCircle, Loader2, Flame, Beef, Wheat, Droplets, Salad } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('goals');
  const [goals, setGoals] = useState(user?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 });
  const [profile, setProfile] = useState({ name: user?.name || '', ...(user?.profile || {}) });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveGoals = async () => {
    setSaving(true);
    try {
      const { data } = await axios.patch(`${API}/users/goals`, goals);
      updateUser(data.user); flash();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await axios.patch(`${API}/users/profile`, { name: profile.name, profile });
      updateUser(data.user); flash();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const goalFields = [
    { key: 'calories', label: 'Daily Calories', unit: 'kcal', min: 1000, max: 5000, step: 50, icon: Flame,    color: '#fbbf24' },
    { key: 'protein',  label: 'Protein Goal',   unit: 'g',    min: 10,   max: 300,  step: 5,  icon: Beef,     color: '#a78bfa' },
    { key: 'carbs',    label: 'Carbs Goal',      unit: 'g',    min: 10,   max: 600,  step: 5,  icon: Wheat,    color: '#60a5fa' },
    { key: 'fat',      label: 'Fat Goal',        unit: 'g',    min: 10,   max: 200,  step: 5,  icon: Droplets, color: '#f472b6' },
    { key: 'fiber',    label: 'Fiber Goal',      unit: 'g',    min: 5,    max: 100,  step: 5,  icon: Salad,    color: '#34d399' },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-[fadeInUp_0.5s_ease-out_both]">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Profile</h1>
        <p className="text-slate-500 font-medium">Manage your goals and personal information.</p>
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
        {[
          { id: 'goals',   label: 'Goals',   icon: Target },
          { id: 'profile', label: 'Details', icon: User   },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Goals Tab */}
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
                    {goals[key]} <span className="text-sm text-slate-400 font-semibold">{unit}</span>
                  </span>
                </div>
                <input type="range" min={min} max={max} step={step} value={goals[key]}
                  onChange={e => setGoals({ ...goals, [key]: +e.target.value })}
                  className="w-full h-2 rounded-full cursor-pointer appearance-none bg-slate-200"
                  style={{ accentColor: color }} />
                <div className="flex justify-between text-xs text-slate-400 font-semibold mt-2">
                  <span>{min} {unit}</span>
                  <span>{max} {unit}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={saveGoals} disabled={saving}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold shadow hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <><CheckCircle className="w-5 h-5 text-green-400" /> Saved!</> : 'Save Goals'}
          </button>
        </div>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
          <h2 className="font-display font-bold text-xl text-slate-800 mb-6">Personal Information</h2>
          <div className="flex flex-col gap-5">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Alex Johnson' },
              { key: 'age',  label: 'Age',       type: 'number', placeholder: '25' },
              { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: '70' },
              { key: 'height', label: 'Height (cm)', type: 'number', placeholder: '175' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={key === 'name' ? profile.name : profile[key] || ''}
                  onChange={e => key === 'name' ? setProfile({ ...profile, name: e.target.value }) : setProfile({ ...profile, [key]: e.target.value })}
                  className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-200 transition-all"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Activity Level</label>
              <select value={profile.activityLevel || ''} onChange={e => setProfile({ ...profile, activityLevel: e.target.value })}
                className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-200 transition-all">
                <option value="">Select level</option>
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (2x per day)</option>
              </select>
            </div>
          </div>

          <button onClick={saveProfile} disabled={saving}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold shadow hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <><CheckCircle className="w-5 h-5 text-green-400" /> Saved!</> : 'Save Profile'}
          </button>
        </div>
      )}
    </div>
  );
}
