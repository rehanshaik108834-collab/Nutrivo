import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine
} from 'recharts';
import { TrendingUp, Flame, Beef, Wheat, Droplets } from 'lucide-react';

const MACRO_COLORS = { calories: '#60a5fa', protein: '#a78bfa', carbs: '#fbbf24', fat: '#f472b6', fiber: '#34d399' };
const PIE_COLORS   = ['#60a5fa', '#fbbf24', '#a78bfa', '#34d399'];
const MONTHS       = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ─── Shared tooltip (daily data) ─── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-2xl px-4 py-3 text-sm">
      <div className="font-bold text-slate-500 mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-extrabold mt-0.5" style={{ color: p.color }}>
          {p.name}: {Math.round(p.value)}{p.name === 'calories' ? ' kcal' : p.name === 'Water' ? ' ml' : 'g'}
        </div>
      ))}
    </div>
  );
}

/* ─── Week tooltip — shows date range on hover ─── */
function WeekTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const dateRange = payload[0]?.payload?.dateRange || label;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-2xl px-4 py-3 text-sm">
      <div className="font-bold text-slate-500 mb-1">{label}</div>
      <div className="text-xs text-slate-400 font-semibold mb-2">{dateRange}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-extrabold mt-0.5" style={{ color: p.color }}>
          {p.name}: {Math.round(p.value)}{p.name === 'calories' ? ' kcal' : p.name === 'Water' ? ' ml' : 'g'}
        </div>
      ))}
    </div>
  );
}

/* ─── Group daily rows into calendar weeks ─── */
function groupByWeek(days, monthNum, yearNum) {
  const weeks = [];
  const chunkSize = 7;
  for (let i = 0; i < days.length; i += chunkSize) {
    const chunk = days.slice(i, Math.min(i + chunkSize, days.length));
    const weekNum = Math.floor(i / chunkSize) + 1;
    const startDay = i + 1;
    const endDay   = Math.min(i + chunkSize, days.length);
    const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][monthNum - 1];
    weeks.push({
      name: `Week ${weekNum}`,
      dateRange: `${monthName} ${startDay} – ${monthName} ${endDay}`,
      calories: Math.round(chunk.reduce((a, d) => a + (d.calories || 0), 0) / chunk.length),
      protein:  Math.round(chunk.reduce((a, d) => a + (d.protein  || 0), 0) / chunk.length),
      carbs:    Math.round(chunk.reduce((a, d) => a + (d.carbs    || 0), 0) / chunk.length),
      fat:      Math.round(chunk.reduce((a, d) => a + (d.fat      || 0), 0) / chunk.length),
      totalMl:  Math.round(chunk.reduce((a, d) => a + (d.totalMl  || 0), 0) / chunk.length),
    });
  }
  return weeks;
}

/* ─── Clean average stat card (no goal comparison) ─── */
function AvgCard({ label, value, unit, bg, text }) {
  return (
    <div className={`${bg} rounded-[24px] p-5`}>
      <div className={`text-xs font-bold uppercase tracking-wider ${text} opacity-70 mb-3`}>{label}</div>
      <div className={`font-display font-extrabold text-2xl ${text}`}>
        {value}<span className="text-sm font-semibold opacity-60 ml-1">{unit}</span>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [view, setView]               = useState('weekly');
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [month, setMonth]             = useState(new Date().getMonth() + 1);
  const [year, setYear]               = useState(new Date().getFullYear());
  const [activeMacro, setActiveMacro] = useState('calories');
  const [waterHistory, setWaterHistory] = useState([]);
  const [waterLoading, setWaterLoading] = useState(true);

  // Refetch nutrition data when view/month/year changes
  useEffect(() => { fetchData(); }, [view, month, year]);

  // Refetch water history when view/month/year changes
  useEffect(() => { fetchWater(); }, [view, month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = view === 'weekly'
        ? `${API}/analytics/weekly`
        : `${API}/analytics/monthly?month=${month}&year=${year}`;
      const { data: d } = await axios.get(url);
      setData(d);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchWater = async () => {
    setWaterLoading(true);
    try {
      const url = view === 'weekly'
        ? `${API}/water/history?days=7`
        : `${API}/water/history?month=${month}&year=${year}`;
      const { data: d } = await axios.get(url);
      setWaterHistory(d.history || []);
    } catch (err) { console.error(err); }
    finally { setWaterLoading(false); }
  };

  const goals = user?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65, water: 2500 };

  // Build chart data — monthly trend keeps full "Oct 1" labels, weekly uses short day names
  const chartData = data ? (data.days || []).map((d) => ({
    name: d.label,
    calories: Math.round(d.nutrition?.calories || 0),
    protein:  Math.round(d.nutrition?.protein  || 0),
    carbs:    Math.round(d.nutrition?.carbs    || 0),
    fat:      Math.round(d.nutrition?.fat      || 0),
    fiber:    Math.round(d.nutrition?.fiber    || 0),
  })) : [];

  // Average only over days that actually have data
  const activeDays = chartData.filter(d => d.calories > 0);
  const avgData = activeDays.length
    ? Object.fromEntries(['calories','protein','carbs','fat','fiber'].map(k => [
        k, Math.round(activeDays.reduce((a, d) => a + d[k], 0) / activeDays.length)
      ]))
    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  // Weekly aggregation for monthly bar charts
  const weeklyCalorieData = view === 'monthly' ? groupByWeek(chartData, month, year) : chartData;
  const weeklyWaterData   = view === 'monthly' ? groupByWeek(
    waterHistory.map(d => ({ ...d })), month, year
  ) : waterHistory;

  const totalDaysLogged = activeDays.length;

  // Trend chart interval: monthly shows every other label to fit "Oct 1" style
  const trendTickInterval = view === 'monthly' ? 4 : 0;

  const macroSummary = [
    { name: 'Protein', value: avgData.protein || 0, fill: MACRO_COLORS.protein },
    { name: 'Carbs',   value: avgData.carbs   || 0, fill: MACRO_COLORS.carbs   },
    { name: 'Fat',     value: avgData.fat     || 0, fill: MACRO_COLORS.fat     },
  ];

  const mealPie = data?.mealTypeDistribution
    ? Object.entries(data.mealTypeDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const macroTabs = [
    { key: 'calories', label: 'Calories', icon: Flame    },
    { key: 'protein',  label: 'Protein',  icon: Beef     },
    { key: 'carbs',    label: 'Carbs',    icon: Wheat    },
    { key: 'fat',      label: 'Fat',      icon: Droplets },
  ];

  // Average water
  const avgWater = waterHistory.length
    ? Math.round(waterHistory.reduce((a, d) => a + d.totalMl, 0) / waterHistory.length)
    : 0;
  const bestWater = waterHistory.length ? Math.max(...waterHistory.map(d => d.totalMl)) : 0;

  // For monthly calorie chart, show every 3rd/5th label to avoid crowding
  const tickInterval = view === 'monthly' ? 4 : 0;

  const periodLabel = view === 'weekly'
    ? 'Last 7 Days'
    : `${MONTHS[month - 1]} ${year}`;

  return (
    <div className="max-w-5xl mx-auto animate-[fadeInUp_0.5s_ease-out_both]">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Analytics</h1>
        <p className="text-slate-500 font-medium">Track your nutrition trends and hydration over time.</p>
      </div>

      {/* ── Period Toggle ── */}
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
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none">
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(+e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-52 skeleton rounded-[28px]" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          {/* ── Calorie Intake Trend Area Chart ── */}
          <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="capitalize">{activeMacro}</span> Intake Trend
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1">{periodLabel}</p>
              </div>
              <div className="text-right">
                <div className="font-display font-extrabold text-3xl leading-none" style={{ color: MACRO_COLORS[activeMacro] }}>
                  {avgData[activeMacro] || 0}
                  <span className="text-sm text-slate-400 font-semibold ml-1">{activeMacro === 'calories' ? 'kcal avg' : 'g avg'}</span>
                </div>
                <div className="text-xs text-slate-400 font-semibold mt-1">{totalDaysLogged} days with data</div>
              </div>
            </div>

            {/* Macro tabs */}
            <div className="flex gap-1.5 bg-slate-50 rounded-xl p-1 mb-5 w-fit">
              {macroTabs.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveMacro(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeMacro === key ? 'bg-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                  style={{ color: activeMacro === key ? MACRO_COLORS[key] : undefined }}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 font-medium">No data for this period yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${activeMacro}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={MACRO_COLORS[activeMacro]} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={MACRO_COLORS[activeMacro]} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} interval={trendTickInterval} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey={activeMacro} stroke={MACRO_COLORS[activeMacro]} strokeWidth={3}
                    fill={`url(#grad-${activeMacro})`}
                    dot={view === 'weekly' ? { fill: MACRO_COLORS[activeMacro], r: 4, strokeWidth: 0 } : false}
                    activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Average Stat Cards ── */}
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
              {view === 'weekly' ? 'Weekly Averages' : `${MONTHS[month - 1]} ${year} Averages`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <AvgCard label="Avg Calories" value={avgData.calories || 0} unit="kcal" color="#60a5fa" bg="bg-blue-50"   text="text-blue-700"   />
              <AvgCard label="Avg Protein"  value={avgData.protein  || 0} unit="g"    color="#a78bfa" bg="bg-purple-50" text="text-purple-700" />
              <AvgCard label="Avg Carbs"    value={avgData.carbs    || 0} unit="g"    color="#fbbf24" bg="bg-amber-50"  text="text-amber-700"  />
              <AvgCard label="Avg Fat"      value={avgData.fat      || 0} unit="g"    color="#f472b6" bg="bg-pink-50"   text="text-pink-700"   />
              <AvgCard
                label="Avg Water"
                value={avgWater >= 1000 ? `${(avgWater / 1000).toFixed(1)}` : avgWater}
                unit={avgWater >= 1000 ? 'L' : 'ml'}
                color="#60a5fa"
                bg="bg-sky-50"
                text="text-sky-700"
              />
            </div>
          </div>

          {/* ── Macro Breakdown by Day + Pie/Distribution ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Grouped bar chart */}
            <div className="md:col-span-2 bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
              <h2 className="font-display font-bold text-xl text-slate-800 mb-5">Macro Breakdown by Day</h2>
              {chartData.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-slate-400 font-medium">No data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={8} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} interval={tickInterval} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="protein" name="protein" fill={MACRO_COLORS.protein} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="carbs"   name="carbs"   fill={MACRO_COLORS.carbs}   radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fat"     name="fat"     fill={MACRO_COLORS.fat}      radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="flex gap-5 mt-4">
                {[['Protein', MACRO_COLORS.protein], ['Carbs', MACRO_COLORS.carbs], ['Fat', MACRO_COLORS.fat]].map(([name, color]) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span className="text-xs font-bold text-slate-500">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut / Pie */}
            <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col">
              <h2 className="font-display font-bold text-xl text-slate-800 mb-5">
                {view === 'monthly' && mealPie.length > 0 ? 'Meal Distribution' : 'Macro Split'}
              </h2>

              {view === 'monthly' && mealPie.length > 0 ? (
                <>
                  <div className="flex justify-center flex-1">
                    <PieChart width={200} height={160}>
                      <Pie data={mealPie} cx={100} cy={75} innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                        {mealPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, fontSize: 12, fontWeight: 600 }} />
                    </PieChart>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {mealPie.map(({ name, value }, i) => (
                      <div key={name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-xs font-bold text-slate-600 capitalize">{name}</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-slate-50 rounded-2xl p-3 text-center">
                    <div className="text-xs text-slate-400 font-semibold">Active logging days</div>
                    <div className="font-display font-extrabold text-xl text-slate-800">{data?.activeDays || totalDaysLogged}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center flex-1">
                    <PieChart width={200} height={160}>
                      <Pie data={macroSummary} cx={100} cy={75} innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                        {macroSummary.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, fontSize: 12, fontWeight: 600 }} />
                    </PieChart>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {macroSummary.map(({ name, value, fill }) => (
                      <div key={name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: fill }} />
                          <span className="text-xs font-bold text-slate-600">{name}</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-800">{value}g</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-slate-50 rounded-2xl p-3 text-center">
                    <div className="text-xs text-slate-400 font-semibold">Days logged</div>
                    <div className="font-display font-extrabold text-xl text-slate-800">{totalDaysLogged}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Daily / Weekly Calorie Intake Bar Chart ── */}
          <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
            <h2 className="font-display font-bold text-xl text-slate-800 mb-1">
              {view === 'weekly' ? 'Daily Calorie Intake' : 'Avg. Calorie Intake by Week'}
            </h2>
            <p className="text-slate-400 text-sm font-medium mb-5">{periodLabel}</p>
            {weeklyCalorieData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-slate-400 font-medium">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyCalorieData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={view === 'monthly' ? <WeekTooltip /> : <CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="calories" name="calories" fill="#60a5fa" radius={[8, 8, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Water Intake Chart (adapts to weekly/monthly) ── */}
          <div className="bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-sky-400" />
                  {view === 'weekly' ? 'Water Intake — Last 7 Days' : `Water Intake — ${MONTHS[month - 1]} ${year}`}
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1">
                  {view === 'weekly' ? 'Daily' : 'Weekly avg'} hydration vs. your {(goals.water || 2500)}ml goal
                </p>
              </div>
              {/* Only show avg/best stats in weekly view */}
              {view === 'weekly' && !waterLoading && waterHistory.some(d => d.totalMl > 0) && (
                <div className="flex gap-5">
                  <div className="text-right">
                    <div className="font-display font-extrabold text-2xl leading-none text-sky-500">
                      {avgWater >= 1000 ? `${(avgWater / 1000).toFixed(1)}L` : `${avgWater}ml`}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mt-1">daily avg</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-extrabold text-2xl leading-none text-sky-700">
                      {bestWater >= 1000 ? `${(bestWater / 1000).toFixed(1)}L` : `${bestWater}ml`}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mt-1">best day</div>
                  </div>
                </div>
              )}
            </div>

            {waterLoading ? (
              <div className="h-40 skeleton rounded-2xl" />
            ) : !waterHistory.some(d => d.totalMl > 0) ? (
              <div className="h-40 flex items-center justify-center text-slate-400 font-medium">
                No water logged yet. Start tracking on the dashboard!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyWaterData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey={view === 'monthly' ? 'name' : 'label'}
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${v / 1000}L` : v} />
                  <Tooltip content={view === 'monthly' ? <WeekTooltip /> : <CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <ReferenceLine y={goals.water || 2500} stroke="#7dd3fc" strokeDasharray="6 3" strokeWidth={2}
                    label={{ value: 'Goal', position: 'insideTopRight', fill: '#7dd3fc', fontSize: 11, fontWeight: 700 }}
                  />
                  <Bar dataKey="totalMl" name="Water" fill="#60a5fa" radius={[8, 8, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
