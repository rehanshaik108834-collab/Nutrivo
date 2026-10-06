import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Flame, Beef, Wheat, Droplets } from 'lucide-react';

const MACRO_COLORS = { calories: '#60a5fa', protein: '#a78bfa', carbs: '#fbbf24', fat: '#f472b6', fiber: '#34d399' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-2xl px-4 py-3 text-sm">
      <div className="font-bold text-slate-500 mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-extrabold" style={{ color: p.color }}>
          {p.name}: {Math.round(p.value)}{p.name === 'calories' ? ' kcal' : 'g'}
        </div>
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

  useEffect(() => { fetchData(); }, [view, month, year]);

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

  const chartData = data ? (data.days || []).map(d => ({
    name: d.label,
    calories: Math.round(d.nutrition?.calories || 0),
    protein: Math.round(d.nutrition?.protein || 0),
    carbs: Math.round(d.nutrition?.carbs || 0),
    fat: Math.round(d.nutrition?.fat || 0),
    fiber: Math.round(d.nutrition?.fiber || 0),
  })) : [];

  const avgCalories = chartData.length ? Math.round(chartData.reduce((a, d) => a + d.calories, 0) / chartData.length) : 0;
  const totalDaysLogged = chartData.filter(d => d.calories > 0).length;

  const macroSummary = data?.summary?.avgNutrition
    ? [
        { name: 'Protein', value: Math.round(data.summary.avgNutrition.protein || 0), fill: MACRO_COLORS.protein },
        { name: 'Carbs',   value: Math.round(data.summary.avgNutrition.carbs   || 0), fill: MACRO_COLORS.carbs   },
        { name: 'Fat',     value: Math.round(data.summary.avgNutrition.fat     || 0), fill: MACRO_COLORS.fat     },
      ]
    : [];

  const macroTabs = [
    { key: 'calories', label: 'Calories', icon: Flame    },
    { key: 'protein',  label: 'Protein',  icon: Beef     },
    { key: 'carbs',    label: 'Carbs',    icon: Wheat    },
    { key: 'fat',      label: 'Fat',      icon: Droplets },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-[fadeInUp_0.5s_ease-out_both]">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Analytics</h1>
        <p className="text-slate-500 font-medium">Track your nutrition trends and hitting your goals over time.</p>
      </div>

      {/* Period Toggle + Month Picker */}
      <div className="flex flex-wrap gap-3 items-center mb-8">
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
          {['weekly', 'monthly'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize ${view === v ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {v}
            </button>
          ))}
        </div>
        {view === 'monthly' && (
          <div className="flex gap-2">
            <select value={month} onChange={e => setMonth(+e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(+e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg Calories',  value: `${avgCalories} kcal`,   color: 'bg-blue-50 text-blue-700' },
          { label: 'Days Logged',   value: `${totalDaysLogged}`,     color: 'bg-amber-50 text-amber-700' },
          { label: 'Avg Protein',   value: `${Math.round(data?.summary?.avgNutrition?.protein || 0)}g`, color: 'bg-purple-50 text-purple-700' },
          { label: 'Calorie Goal',  value: `${Math.round((avgCalories / goals.calories) * 100)}%`, color: 'bg-green-50 text-green-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-[24px] p-5`}>
            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">{label}</div>
            <div className="font-display font-extrabold text-2xl">{value}</div>
          </div>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Trend Overview
          </h2>
          <div className="flex gap-1.5 bg-slate-50 rounded-xl p-1">
            {macroTabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveMacro(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeMacro === key ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                style={{ color: activeMacro === key ? MACRO_COLORS[key] : undefined }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 skeleton rounded-2xl" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 font-medium">No data for this period yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${activeMacro}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={MACRO_COLORS[activeMacro]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={MACRO_COLORS[activeMacro]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={activeMacro} stroke={MACRO_COLORS[activeMacro]} strokeWidth={3}
                fill={`url(#grad-${activeMacro})`} dot={{ fill: MACRO_COLORS[activeMacro], r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Macro Distribution */}
      {macroSummary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
            <h2 className="font-display font-bold text-xl text-slate-800 mb-5">Macro Split</h2>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={macroSummary} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    {macroSummary.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {macroSummary.map(({ name, value, fill }) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: fill }} />
                    <span className="text-sm font-bold text-slate-600">{name}</span>
                    <span className="text-sm font-extrabold text-slate-800 ml-auto">{value}g</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
            <h2 className="font-display font-bold text-xl text-slate-800 mb-5">Daily Calories</h2>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="calories" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
