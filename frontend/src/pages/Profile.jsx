import { useState } from 'react';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';

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
      updateUser(data.user);
      flash();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await axios.patch(`${API}/users/profile`, { name: profile.name, profile });
      updateUser(data.user);
      flash();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const GoalInput = ({ label, key_, unit, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg)', padding: '16px', borderRadius: 12, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600 }}>{label}</label>
        <span style={{ fontSize: 16, color, fontWeight: 800 }}>{goals[key_]} <span style={{ fontSize: 13, fontWeight: 600 }}>{unit}</span></span>
      </div>
      <input type="range" min={key_ === 'calories' ? 1000 : 10} max={key_ === 'calories' ? 5000 : 500}
        step={key_ === 'calories' ? 50 : 5} value={goals[key_]}
        onChange={e => setGoals({...goals, [key_]: +e.target.value})}
        style={{ accentColor: color, width: '100%', cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>
        <span>{key_ === 'calories' ? '1000 kcal' : '10g'}</span>
        <span>{key_ === 'calories' ? '5000 kcal' : '500g'}</span>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Profile</h1>
        <p style={{ color: 'var(--text3)', fontSize: 16, fontWeight: 500 }}>Manage your goals, personal information, and preferences.</p>
      </div>

      {/* User card */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, padding: '32px' }}>
        <div style={{
          width: 80, height: 80, background: 'linear-gradient(135deg, var(--purple), var(--pink))',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 32, fontFamily: 'var(--font-display)',
          boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)'
        }}>{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{user?.name}</div>
          <div style={{ color: 'var(--text2)', fontSize: 15, fontWeight: 500 }}>{user?.email}</div>
        </div>
        {user?.streak > 0 && (
          <div style={{ marginLeft: 'auto', textAlign: 'center', background: 'var(--surface2)', padding: '12px 24px', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🔥</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--lime-dim)', lineHeight: 1 }}>{user.streak}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Day Streak</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, background: 'var(--surface)', borderRadius: 16, padding: 6, marginBottom: 32, border: '1px solid var(--border)' }}>
        {['goals', 'personal'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: tab === t ? 'var(--lime)' : 'transparent',
            color: tab === t ? '#000' : 'var(--text2)',
            fontWeight: 700, fontSize: 15, transition: 'all 0.2s', textTransform: 'capitalize',
            boxShadow: tab === t ? '0 2px 8px var(--lime-glow)' : 'none'
          }}>{t === 'goals' ? 'Nutrition Goals' : 'Personal Info'}</button>
        ))}
      </div>

      {tab === 'goals' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
            <GoalInput label="Daily Calorie Goal" key_="calories" unit="kcal" color="var(--lime)" />
            <GoalInput label="Protein Target" key_="protein" unit="g" color="var(--blue)" />
            <GoalInput label="Carbohydrates Target" key_="carbs" unit="g" color="var(--amber)" />
            <GoalInput label="Fat Target" key_="fat" unit="g" color="var(--purple)" />
            <GoalInput label="Fiber Target" key_="fiber" unit="g" color="var(--teal)" />
          </div>

          {/* Macro preview */}
          <div style={{ background: 'var(--bg)', borderRadius: 16, padding: '24px', marginBottom: 32, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Macro Split Preview</div>
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
              {(() => {
                const totalCals = goals.protein * 4 + goals.carbs * 4 + goals.fat * 9;
                return [
                  ['var(--blue)', (goals.protein * 4 / totalCals) * 100],
                  ['var(--amber)', (goals.carbs * 4 / totalCals) * 100],
                  ['var(--purple)', (goals.fat * 9 / totalCals) * 100],
                ].map(([color, pct], i) => (
                  <div key={i} style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: i === 0 ? '6px 0 0 6px' : i === 2 ? '0 6px 6px 0' : 0 }} />
                ));
              })()}
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
              {[['Protein', 'var(--blue)', goals.protein * 4], ['Carbs', 'var(--amber)', goals.carbs * 4], ['Fat', 'var(--purple)', goals.fat * 9]].map(([l, c, cal]) => (
                <div key={l} style={{ fontSize: 13, color: c, fontWeight: 700, background: 'var(--surface)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  {l}: {Math.round(cal / (goals.protein * 4 + goals.carbs * 4 + goals.fat * 9) * 100)}%
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-lime" onClick={saveGoals} disabled={saving} style={{ width: '100%', padding: '16px', borderRadius: 12, fontSize: 16 }}>
            {saving ? <span className="spinner" /> : saved ? '✓ Saved Successfully!' : 'Save Nutrition Goals'}
          </button>
        </div>
      )}

      {tab === 'personal' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>Full Name</label>
              <input className="input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Your name" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>Age</label>
                <input className="input" type="number" value={profile.age || ''} onChange={e => setProfile({...profile, age: +e.target.value})} placeholder="25" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>Weight (kg)</label>
                <input className="input" type="number" value={profile.weight || ''} onChange={e => setProfile({...profile, weight: +e.target.value})} placeholder="70" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>Height (cm)</label>
                <input className="input" type="number" value={profile.height || ''} onChange={e => setProfile({...profile, height: +e.target.value})} placeholder="175" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>Goal</label>
              <select className="input" value={profile.goal || 'maintain'} onChange={e => setProfile({...profile, goal: e.target.value})} style={{ cursor: 'pointer' }}>
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>Activity Level</label>
              <select className="input" value={profile.activityLevel || 'moderate'} onChange={e => setProfile({...profile, activityLevel: e.target.value})} style={{ cursor: 'pointer' }}>
                <option value="sedentary">Sedentary (desk job)</option>
                <option value="light">Light (1-3x/week)</option>
                <option value="moderate">Moderate (3-5x/week)</option>
                <option value="active">Active (6-7x/week)</option>
                <option value="very_active">Very Active (athlete)</option>
              </select>
            </div>
          </div>

          <button className="btn btn-lime" onClick={saveProfile} disabled={saving} style={{ width: '100%', padding: '16px', borderRadius: 12, fontSize: 16 }}>
            {saving ? <span className="spinner" /> : saved ? '✓ Saved Successfully!' : 'Save Profile Info'}
          </button>
        </div>
      )}
    </div>
  );
}
