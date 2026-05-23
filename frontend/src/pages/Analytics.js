import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const MACRO_COLORS = { calories: 'var(--lime)', protein: 'var(--blue)', carbs: 'var(--amber)', fat: 'var(--purple)', fiber: 'var(--teal)' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
      <div style={{ color: 'var(--text2)', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700, marginTop: 4 }}>{p.name}: {Math.round(p.value)}{p.name === 'calories' ? ' kcal' : 'g'}</div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [view, setView] = useState('weekly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeMacro, setActiveMacro] = useState('calories');

  useEffect(() => {
    fetchData();
  }, [view, month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'weekly') {
        const { data: d } = await axios.get(`${API}/analytics/weekly`);
        setData(d);
      } else {
        const { data: d } = await axios.get(`${API}/analytics/monthly?month=${month}&year=${year}`);
        setData(d);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const goals = user?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  const chartData = data ? (view === 'weekly' ? data.days : data.days).map(d => ({
    name: view === 'weekly' ? d.label : d.label,
    calories: Math.round(d.nutrition?.calories || 0),
    protein: Math.round(d.nutrition?.protein || 0),
    carbs: Math.round(d.nutrition?.carbs || 0),
    fat: Math.round(d.nutrition?.fat || 0),
    fiber: Math.round(d.nutrition?.fiber || 0),
  })) : [];

  const avgData = data?.averages || {};
  const mealPie = data?.mealTypeBreakdown ? Object.entries(data.mealTypeBreakdown)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v })) : [];
  const PIE_COLORS = ['var(--amber)', 'var(--blue)', 'var(--purple)', 'var(--teal)'];

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Analytics</h1>
        <p style={{ color: 'var(--text3)', fontSize: 16, fontWeight: 500 }}>Track your nutrition trends over time and gain insights.</p>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', borderRadius: 12, padding: 6, border: '1px solid var(--border)' }}>
          {['weekly', 'monthly'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '8px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: view === v ? 'var(--lime)' : 'transparent',
              color: view === v ? '#000' : 'var(--text2)',
              fontWeight: 700, fontSize: 14, transition: 'all 0.2s', textTransform: 'capitalize',
              boxShadow: view === v ? '0 2px 8px var(--lime-glow)' : 'none'
            }}>{v}</button>
          ))}
        </div>
        
        {view === 'monthly' && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select value={month} onChange={e => setMonth(+e.target.value)} style={selectStyle}>
              {monthNames.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(+e.target.value)} style={selectStyle}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}

        {/* Macro selector */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {Object.keys(MACRO_COLORS).map(m => (
            <button key={m} onClick={() => setActiveMacro(m)} style={{
              padding: '8px 16px', borderRadius: 100, border: '1px solid',
              cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
              background: activeMacro === m ? MACRO_COLORS[m] : 'var(--surface)',
              borderColor: activeMacro === m ? MACRO_COLORS[m] : 'var(--border)',
              color: activeMacro === m ? '#fff' : 'var(--text2)',
              textTransform: 'capitalize',
              boxShadow: activeMacro === m ? `0 4px 12px ${MACRO_COLORS[m]}40` : 'none'
            }}>{m}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 'var(--r-lg)' }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main chart */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{activeMacro} Intake Trend</div>
                <div style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>{view === 'weekly' ? 'Last 7 days' : `${monthNames[month-1]} ${year}`}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: MACRO_COLORS[activeMacro], lineHeight: 1 }}>
                  {Math.round(avgData[activeMacro] || 0)}
                  <span style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 600, marginLeft: 8 }}>{activeMacro === 'calories' ? 'kcal avg' : 'g avg'}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8, fontWeight: 500 }}>
                  Daily Goal: {goals[activeMacro] || '-'}{activeMacro === 'calories' ? ' kcal' : 'g'}
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id={`grad-${activeMacro}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={MACRO_COLORS[activeMacro]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={MACRO_COLORS[activeMacro]} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey={activeMacro} stroke={MACRO_COLORS[activeMacro]}
                  strokeWidth={3} fill={`url(#grad-${activeMacro})`} dot={{ fill: 'var(--surface)', stroke: MACRO_COLORS[activeMacro], strokeWidth: 2, r: 5 }} activeDot={{ r: 7, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { label: 'Avg Calories', value: Math.round(avgData.calories || 0), unit: 'kcal', color: 'var(--lime)', goal: goals.calories },
              { label: 'Avg Protein', value: Math.round(avgData.protein || 0), unit: 'g', color: 'var(--blue)', goal: goals.protein },
              { label: 'Avg Carbs', value: Math.round(avgData.carbs || 0), unit: 'g', color: 'var(--amber)', goal: goals.carbs },
              { label: 'Avg Fat', value: Math.round(avgData.fat || 0), unit: 'g', color: 'var(--purple)', goal: goals.fat },
            ].map(stat => {
              const pct = Math.min((stat.value / Math.max(stat.goal, 1)) * 100, 100);
              return (
                <div key={stat.label} className="card card-hover" style={{ padding: '24px' }}>
                  <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>{stat.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: stat.color, marginBottom: 16 }}>
                    {stat.value}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text3)', marginLeft: 4 }}>{stat.unit}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: stat.color, borderRadius: 3, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10, fontWeight: 500 }}>{Math.round(pct)}% of daily goal</div>
                </div>
              );
            })}
          </div>

          {/* Bar chart all macros + pie */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
                Macro Breakdown by Day
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }} barSize={10} barGap={2}>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: 'var(--text3)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg3)', opacity: 0.5 }} />
                  <Bar dataKey="protein" fill="var(--blue)" radius={[4,4,0,0]} />
                  <Bar dataKey="carbs" fill="var(--amber)" radius={[4,4,0,0]} />
                  <Bar dataKey="fat" fill="var(--purple)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {view === 'monthly' && mealPie.length > 0 && (
              <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Meal Distribution</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PieChart width={280} height={220}>
                    <Pie data={mealPie} cx={140} cy={100} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                      {mealPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Legend formatter={(v) => <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>{v}</span>} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-md)', color: 'var(--text)', fontWeight: 600 }} itemStyle={{ color: 'var(--text)' }} />
                  </PieChart>
                </div>
                {view === 'monthly' && (
                  <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 16, textAlign: 'center', background: 'var(--bg)', padding: '12px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    Active logging days: <span style={{ color: 'var(--lime-dim)', fontWeight: 800, fontSize: 16 }}>{data?.activeDays || 0}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)',
  borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', outline: 'none',
  boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s'
};
