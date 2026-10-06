import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';
import { Search, Bell, Calendar, ChevronLeft, ChevronRight, Check, Plus, Edit2, MoreVertical, Flame } from 'lucide-react';

/* ─── Exact Colors from Reference Image ─── */
const COLORS = {
  cyan: '#bfeaf0',
  cyanDark: '#8bd3dd',
  green: '#d4f2bc',
  yellow: '#fff4a3',
  yellowDark: '#eada6e',
  textMain: '#1e293b',
  textMuted: '#64748b',
};

const MEAL_THEMES = {
  breakfast: { bg: 'bg-[#d4f2bc]', color: '#568b2a' },
  lunch: { bg: 'bg-[#bfeaf0]', color: '#2a7c8b' },
  dinner: { bg: 'bg-[#f4e6f9]', color: '#8b2a8b' },
  snack: { bg: 'bg-[#fff4a3]', color: '#8b782a' },
};

/* ─── Calorie Arc Card ─── */
function CalorieProgress({ value, goal }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="bg-[#bfeaf0] rounded-[32px] p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
      {/* Decorative element from image */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
      
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Flame className="w-4 h-4 text-[#8bd3dd]" />
          </div>
          <span className="font-bold text-slate-700">Your Progress</span>
        </div>
        <div className="font-display font-extrabold text-5xl text-slate-800 mb-1">{Math.round(pct)}%</div>
        <div className="text-sm font-semibold text-slate-600 flex items-center gap-1">
          {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
          <span className="text-xs">▼</span>
        </div>
      </div>

      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" />
          <circle cx="50" cy="50" r={r} fill="none"
            stroke="#fff4a3" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display font-extrabold text-xl text-slate-800">{goal}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Calories</div>
        </div>
        {/* Yellow dot on arc */}
        <div className="absolute top-[10%] right-[10%] w-3 h-3 bg-[#fff4a3] rounded-full border-2 border-white"></div>
      </div>
    </div>
  );
}

/* ─── Vertical Macro Pill (from image) ─── */
function MacroPill({ label, value, max, color }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-36 bg-slate-50 rounded-full flex flex-col justify-end p-1.5 shadow-inner relative">
        <div className="w-full rounded-full transition-all duration-1000 flex flex-col items-center justify-start py-2" style={{ height: `${Math.max(pct, 20)}%`, background: color }}>
           {/* If pct is high enough, put value inside the pill, else above */}
           <span className="text-[10px] font-extrabold text-white bg-white/30 px-1.5 py-0.5 rounded-full">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-500">{label}</span>
    </div>
  );
}

/* ─── Dashboard ─── */
export default function Dashboard() {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/meals/date/${selectedDate}`);
      setMeals(data.meals || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const nutrition = meals.reduce((acc, m) => {
    const n = m.nutrition || {};
    return {
      calories: acc.calories + (n.calories || 0),
      protein:  acc.protein  + (n.protein  || 0),
      carbs:    acc.carbs    + (n.carbs    || 0),
      fat:      acc.fat      + (n.fat      || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const goals = user?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };
  const calLeft = Math.max(goals.calories - nutrition.calories, 0);

  // Generate weekday pills based on current date
  const generateWeek = () => {
    const dates = [];
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() - curr.getDay() + 1); // Start on Monday
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      dates.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        dateStr: d.toISOString().split('T')[0]
      });
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const weekDates = generateWeek();

  return (
    <div className="max-w-xl mx-auto pb-12 animate-[fadeInUp_0.5s_ease-out_both] font-sans">
      
      {/* ── Mobile-style Top Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 p-0.5">
             <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-amber-500 font-extrabold text-xl">
               {user?.name?.[0]?.toUpperCase()}
             </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500">Hello,</div>
            <div className="font-display font-extrabold text-lg text-slate-800">{user?.name?.split(' ')[0]}!</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-500 hover:bg-slate-50">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-500 hover:bg-slate-50 relative">
            <Bell className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white"></div>
          </button>
        </div>
      </div>

      {/* ── Progress Card ── */}
      <div className="mb-6">
        <CalorieProgress value={nutrition.calories} goal={goals.calories} />
      </div>

      {/* ── Week Days Pill Selector ── */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-bold text-lg text-slate-800">Week Days</h2>
          <button className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-500">
            <Calendar className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between gap-1">
          {weekDates.map((d) => {
            const isSel = d.dateStr === selectedDate;
            return (
              <button key={d.dateStr} onClick={() => setSelectedDate(d.dateStr)}
                className={`flex flex-col items-center justify-between py-4 w-12 rounded-full transition-all ${isSel ? 'bg-[#bfeaf0] shadow-sm' : 'bg-transparent hover:bg-slate-50'}`}>
                <span className={`text-xs font-bold mb-3 ${isSel ? 'text-slate-800' : 'text-slate-400'}`}>{d.dayName}</span>
                {isSel && <div className="w-1.5 h-1.5 bg-slate-800 rounded-full mb-3" />}
                <span className={`text-sm font-extrabold ${isSel ? 'text-slate-800' : 'text-slate-500'}`}>{d.dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Calorie Left & Bar ── */}
      <div className="mb-8">
        <div className="text-sm font-bold text-slate-500 mb-1">Calorie left</div>
        <div className="font-display font-extrabold text-5xl text-slate-800 flex items-baseline gap-2 mb-4">
          {calLeft} <span className="text-lg font-bold text-slate-400">kcal</span>
        </div>
        {/* Colorful Bar */}
        <div className="h-4 w-full rounded-full flex overflow-hidden bg-slate-50">
          <div className="h-full bg-[#bfeaf0]" style={{ width: '45%' }}></div>
          <div className="h-full bg-[#d4f2bc]" style={{ width: '30%' }}></div>
          <div className="h-full bg-[#fff4a3]" style={{ width: '20%' }}></div>
        </div>
      </div>

      {/* ── Vertical Macro Pills ── */}
      <div className="mb-8">
         <div className="flex justify-between items-end px-2">
           <MacroPill label="Cal" value={nutrition.calories} max={goals.calories} color="#d4f2bc" />
           <MacroPill label="Prot" value={nutrition.protein} max={goals.protein} color="#bfeaf0" />
           <MacroPill label="Carb" value={nutrition.carbs} max={goals.carbs} color="#fff4a3" />
           <MacroPill label="Fats" value={nutrition.fat} max={goals.fat} color="#f4e6f9" />
         </div>
      </div>

      {/* ── Meal Cards Grid ── */}
      <div className="mb-6 flex items-center justify-between">
         <h2 className="font-display font-bold text-xl text-slate-800">Today's Meals</h2>
         <Link to="/log" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-slate-700 shadow-md transition-all">
           <Plus className="w-5 h-5" />
         </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
           <div className="h-40 skeleton rounded-[32px]"></div>
           <div className="h-40 skeleton rounded-[32px]"></div>
        </div>
      ) : meals.length === 0 ? (
        <div className="bg-slate-50 rounded-[32px] p-8 text-center border border-dashed border-slate-200">
          <div className="text-4xl mb-3">🍽️</div>
          <div className="font-bold text-slate-700">No meals logged today</div>
          <Link to="/log" className="text-blue-500 font-bold text-sm mt-2 inline-block">Log your first meal &rarr;</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {meals.map((meal, idx) => {
            // Apply different themes to make it colorful
            const themeKeys = Object.keys(MEAL_THEMES);
            const theme = MEAL_THEMES[meal.mealType] || MEAL_THEMES[themeKeys[idx % themeKeys.length]];
            const cals = Math.round(meal.nutrition?.calories || 0);

            return (
              <div key={meal._id} className={`${theme.bg} rounded-[32px] p-5 relative flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-transform cursor-pointer shadow-sm`}>
                <div className="absolute top-4 right-4">
                  <MoreVertical className="w-5 h-5 opacity-40" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800 leading-tight pr-6">{meal.name}</h3>
                  <div className="flex items-center gap-1.5 mt-2 opacity-70">
                    <div className="w-1.5 h-3 bg-white rounded-full"></div>
                    <span className="text-sm font-extrabold text-slate-800">{cals} Calories</span>
                  </div>
                  {meal.nutrition?.carbs > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 opacity-70">
                      <div className="w-1.5 h-3 bg-white rounded-full"></div>
                      <span className="text-sm font-extrabold text-slate-800">{Math.round(meal.nutrition.carbs)}g Carbs</span>
                    </div>
                  )}
                </div>
                {/* Image snippet if available */}
                {meal.imageData && (
                  <div className="absolute bottom-[-10px] right-[-10px] w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-sm">
                    <img src={`data:${meal.imageMimeType};base64,${meal.imageData}`} alt="food" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer Banner ── */}
      <div className="mt-8 bg-[#fff4a3] rounded-full p-4 flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.02] transition-transform">
         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-lg">📊</span>
         </div>
         <span className="font-bold text-slate-800">Calorie count &gt;&gt;&gt;</span>
         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-lg">📋</span>
         </div>
      </div>
    </div>
  );
}
