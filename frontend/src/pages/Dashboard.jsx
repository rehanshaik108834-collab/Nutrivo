import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';
import MacroRing from '../components/MacroRing';
import { ChevronLeft, ChevronRight, Flame, Plus, Target, Calendar, Trash2 } from 'lucide-react';

const MEAL_COLORS = { 
  breakfast: 'bg-pastel-yellow text-amber-800', 
  lunch: 'bg-pastel-blue text-blue-800', 
  dinner: 'bg-pastel-purple text-purple-800', 
  snack: 'bg-pastel-green text-green-800' 
};

function CalorieRing({ value, goal }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const over = value > goal;

  return (
    <div className="relative flex justify-center items-center h-48 w-48 mx-auto mt-4 mb-2">
      <svg width="100%" height="100%" viewBox="0 0 160 160" className="transform -rotate-90 drop-shadow-md">
        <circle cx="80" cy="80" r={r} fill="none" className="stroke-slate-50" strokeWidth={18} strokeLinecap="round" />
        <circle cx="80" cy="80" r={r} fill="none" className={over ? "stroke-red-400" : "stroke-blue-400"} strokeWidth={18}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-4xl font-display font-extrabold text-slate-800 tracking-tight leading-none">
          {Math.round(over ? value - goal : goal - value)}
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          {over ? 'Kcal Over' : 'Kcal Left'}
        </div>
      </div>
    </div>
  );
}

function MealRow({ meal, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Remove this meal?')) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/meals/${meal._id}`);
      onDelete(meal._id);
    } catch { setDeleting(false); }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-[20px] transition-colors border border-slate-100 group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs uppercase tracking-wider ${MEAL_COLORS[meal.mealType] || 'bg-slate-200 text-slate-700'}`}>
          {meal.mealType.substring(0,2)}
        </div>
        <div>
          <div className="font-bold text-slate-800 text-base">{meal.name}</div>
          <div className="text-sm font-semibold text-slate-400">
            {new Date(meal.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-display font-extrabold text-xl text-slate-800">{Math.round(meal.nutrition?.calories || 0)}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">kcal</div>
        </div>
        <button onClick={handleDelete} disabled={deleting} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 disabled:opacity-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

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
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const nutrition = meals.reduce((acc, m) => {
    const n = m.nutrition || {};
    acc.calories += n.calories || 0;
    acc.protein += n.protein || 0;
    acc.carbs += n.carbs || 0;
    acc.fat += n.fat || 0;
    acc.fiber += n.fiber || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const goals = user?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.round((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-12 animate-[fadeInUp_0.6s_ease-out_forwards]">
        
        {/* Header & Date Nav */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
              {isToday ? `Good ${getGreeting()}, ` : formatDate(selectedDate)}
              {isToday && <span className="text-blue-500">{user?.name?.split(' ')[0]}!</span>}
            </h1>
            <p className="text-slate-500 font-medium">Your boards look so good! Keep it up.</p>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
            <button onClick={() => changeDate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-pastel-blue/30 text-blue-800 rounded-full font-bold text-sm">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedDate)}
            </div>
            <button onClick={() => changeDate(1)} disabled={isToday} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-30">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Calorie Block (Bento Large) */}
          <div className="md:col-span-5 bg-white rounded-[32px] p-8 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h2 className="font-display font-bold text-xl text-slate-800">Calories</h2>
              <div className="bg-pastel-yellow text-amber-600 w-10 h-10 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            
            <CalorieRing value={nutrition.calories} goal={goals.calories} />
            
            <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-4 mt-2">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Eaten</div>
                <div className="font-display font-extrabold text-xl text-slate-800">{Math.round(nutrition.calories)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Goal</div>
                <div className="font-display font-extrabold text-xl text-slate-800">{goals.calories}</div>
              </div>
            </div>
          </div>

          {/* Macros & Stats Blocks (Bento Split) */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* Macros Row */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100 flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-bold text-xl text-slate-800">Macronutrients</h2>
                <Target className="w-6 h-6 text-slate-400" />
              </div>
              
              <div className="flex justify-around items-end h-full pb-4">
                <MacroRing value={nutrition.protein} goal={goals.protein} colorClass="stroke-blue-400" label="Protein" size={80} />
                <MacroRing value={nutrition.carbs} goal={goals.carbs} colorClass="stroke-amber-400" label="Carbs" size={80} />
                <MacroRing value={nutrition.fat} goal={goals.fat} colorClass="stroke-purple-400" label="Fats" size={80} />
                <MacroRing value={nutrition.fiber} goal={goals.fiber || 30} colorClass="stroke-green-400" label="Fiber" size={80} />
              </div>
            </div>

            {/* Meals Log Overview */}
            <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100">
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="font-display font-bold text-xl text-slate-800">Today's Log</h2>
                <Link to="/log" className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </Link>
              </div>

              {loading ? (
                <div className="animate-pulse flex flex-col gap-3">
                  <div className="h-16 bg-slate-100 rounded-[20px]" />
                  <div className="h-16 bg-slate-100 rounded-[20px]" />
                </div>
              ) : meals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🍽️</div>
                  <div className="font-bold text-slate-700">No meals logged yet</div>
                  <div className="text-sm text-slate-500 mt-1">Tap the plus icon to start tracking!</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {meals.map(meal => (
                    <MealRow key={meal._id} meal={meal} onDelete={id => setMeals(prev => prev.filter(m => m._id !== id))} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
