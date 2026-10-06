import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';
import {
  ChevronLeft, ChevronRight, Plus, Flame, Calendar, Trash2,
  Target, Zap, Droplets, Sparkles, X, Clock, Users, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';

const MEAL_TAG = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch:     'bg-blue-100 text-blue-700',
  dinner:    'bg-purple-100 text-purple-700',
  snack:     'bg-green-100 text-green-700',
};

/* ─── Calorie Arc ─── */
function CalorieArc({ value, goal }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  const r = 58;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const over = value > goal;
  const remaining = Math.round(Math.abs(goal - value));

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
          <circle cx="70" cy="70" r={r} fill="none"
            stroke={over ? '#f87171' : '#60a5fa'}
            strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="font-display font-extrabold text-3xl text-slate-800 leading-none">{remaining}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {over ? 'over' : 'left'}
          </div>
        </div>
      </div>
      <div className="flex justify-between w-full mt-3 px-2">
        <div className="text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eaten</div>
          <div className="font-display font-extrabold text-lg text-slate-800">{Math.round(value)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal</div>
          <div className="font-display font-extrabold text-lg text-slate-800">{goal}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini Macro Bar ─── */
function MacroBar({ label, value, goal, colorClass }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-extrabold text-slate-800">{Math.round(value)}<span className="text-slate-400 font-semibold">g</span></span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-right mt-0.5">
        <span className="text-[10px] text-slate-400 font-semibold">of {goal}g</span>
      </div>
    </div>
  );
}

/* ─── Custom Water Input ─── */
function CustomWaterInput({ onAdd, disabled }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const ml = parseInt(value, 10);
    if (!ml || ml <= 0 || ml > 5000) {
      setError('Enter a value between 1–5000 ml');
      return;
    }
    setError('');
    onAdd(ml);
    setValue('');
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            min="1"
            max="5000"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Custom ml…"
            className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">ml</span>
        </div>
        <button
          onClick={handleAdd}
          disabled={disabled || !value}
          className="px-4 py-3 rounded-2xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] flex items-center gap-1.5 shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-semibold pl-1">{error}</p>}
    </div>
  );
}

/* ─── Water Tracker Card ─── */
function WaterTracker({ isToday, waterGoal }) {
  const [totalMl, setTotalMl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API}/water`);
        setTotalMl(data.totalMl || 0);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const addWater = async (ml) => {
    if (!isToday || adding) return;
    setAdding(true);
    try {
      const { data } = await axios.post(`${API}/water`, { amountInMl: ml });
      setTotalMl(data.totalMl);
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  const goal = waterGoal || 2500;
  const pct = Math.min((totalMl / goal) * 100, 100);
  const remaining = Math.max(goal - totalMl, 0);

  // Wave SVG fill levels
  const waveHeight = 80 - (pct * 0.8); // SVG y-start (100 = empty, 20 = full)

  return (
    <div className="lg:col-span-4 bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-slate-800">Hydration</h2>
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
          <Droplets className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      {/* Animated wave container */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <clipPath id="circle-clip">
                <circle cx="50" cy="50" r="46" />
              </clipPath>
            </defs>
            {/* Background circle */}
            <circle cx="50" cy="50" r="46" fill="#eff6ff" />
            {/* Wave fill */}
            <g clipPath="url(#circle-clip)">
              <rect
                x="0" y={waveHeight}
                width="100" height={100 - waveHeight + 5}
                fill="#60a5fa"
                style={{ transition: 'y 1.2s cubic-bezier(0.16,1,0.3,1)' }}
              />
            </g>
            {/* Border */}
            <circle cx="50" cy="50" r="46" fill="none" stroke="#bfdbfe" strokeWidth="3" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display font-extrabold text-2xl text-slate-800 leading-none">
              {totalMl >= 1000 ? `${(totalMl / 1000).toFixed(1)}L` : `${totalMl}`}
            </div>
            {totalMl < 1000 && <div className="text-[10px] font-bold text-slate-400 mt-0.5">ml</div>}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-slate-400 font-semibold">
            {remaining > 0 ? `${remaining}ml to go · goal ${goal}ml` : '🎉 Goal reached!'}
          </div>
        </div>
      </div>

      {/* Quick add buttons */}
      {isToday && (
        <div className="flex gap-2">
          {[250, 500].map(ml => (
            <button key={ml} onClick={() => addWater(ml)} disabled={adding}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all hover:scale-[1.02] disabled:opacity-50 active:scale-[0.98]">
              <Droplets className="w-3.5 h-3.5" />
              +{ml}ml
            </button>
          ))}
        </div>
      )}

      {/* Custom ml input */}
      {isToday && <CustomWaterInput onAdd={addWater} disabled={adding} />}
    </div>
  );
}

/* ─── Recipe Modal ─── */
function RecipeModal({ onClose, remainingMacros }) {
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.post(`${API}/recipes/suggest`, { remainingMacros });
        setRecipe(data.recipe);
      } catch (e) {
        setError(e?.response?.data?.message || 'Could not generate recipe. Try again!');
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[32px] max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-[fadeInUp_0.3s_ease-out_both]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-[32px] px-7 pt-7 pb-4 border-b border-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">AI Chef</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-slate-800 leading-tight">
              {loading ? 'Generating recipe…' : recipe?.name || 'Oops!'}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0 ml-4">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="px-7 py-5">
          {loading ? (
            <div className="flex flex-col items-center gap-5 py-12">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
              <div className="text-center">
                <div className="font-bold text-slate-700 mb-1">Cooking up a recipe…</div>
                <div className="text-sm text-slate-400 font-medium">Gemini AI is crafting the perfect meal to hit your remaining macros</div>
              </div>
              <div className="flex gap-6">
                {['Analyzing macros', 'Selecting foods', 'Writing recipe'].map((s, i) => (
                  <div key={s} className="flex flex-col items-center gap-2 text-xs font-bold text-slate-400">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">😔</div>
              <div className="font-bold text-slate-700 mb-2">Something went wrong</div>
              <div className="text-sm text-slate-400">{error}</div>
            </div>
          ) : recipe && (
            <>
              {/* Description */}
              <p className="text-slate-500 font-medium mb-5">{recipe.description}</p>

              {/* Meta tags */}
              <div className="flex gap-3 mb-5 flex-wrap">
                {recipe.prepTime && (
                  <div className="flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{recipe.prepTime}</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Macro alignment */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                  { label: 'Calories', value: Math.round(recipe.nutrition?.calories || 0), unit: 'kcal', color: 'bg-amber-50 text-amber-700' },
                  { label: 'Protein',  value: Math.round(recipe.nutrition?.protein  || 0), unit: 'g',    color: 'bg-purple-50 text-purple-700' },
                  { label: 'Carbs',    value: Math.round(recipe.nutrition?.carbs    || 0), unit: 'g',    color: 'bg-blue-50 text-blue-700' },
                  { label: 'Fat',      value: Math.round(recipe.nutrition?.fat      || 0), unit: 'g',    color: 'bg-pink-50 text-pink-700' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className={`${color} rounded-2xl p-3 text-center`}>
                    <div className="font-display font-extrabold text-lg leading-none">{value}<span className="text-[10px] font-bold ml-0.5">{unit}</span></div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">{label}</div>
                  </div>
                ))}
              </div>

              {/* Ingredients */}
              <div className="mb-5">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Ingredients</div>
                <div className="flex flex-col gap-2">
                  {recipe.ingredients?.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-slate-50 rounded-2xl">
                      <span className="font-semibold text-slate-700 text-sm">{ing.item}</span>
                      <span className="font-bold text-slate-500 text-sm">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions - collapsible */}
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors mb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Instructions</span>
                {showInstructions ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showInstructions && (
                <div className="flex flex-col gap-3 mb-5">
                  {recipe.instructions?.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{step.replace(/^Step \d+:\s*/i, '')}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Tip */}
              {recipe.tip && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">Chef's Tip</span>
                  </div>
                  <p className="text-sm text-amber-800 font-medium">{recipe.tip}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Meal Card ─── */
function MealCard({ meal, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Remove this meal?')) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/meals/${meal._id}`);
      onDelete(meal._id);
    } catch { setDeleting(false); }
  };

  const cals = Math.round(meal.nutrition?.calories || 0);

  return (
    <div className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
        {meal.imageData ? (
          <img
            src={`data:${meal.imageMimeType};base64,${meal.imageData}`}
            alt={meal.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${MEAL_TAG[meal.mealType] || 'bg-slate-100 text-slate-500'}`}>
            {meal.mealType}
          </span>
        </div>
        <div className="font-bold text-slate-800 text-sm truncate">{meal.name}</div>
        <div className="text-xs text-slate-400 font-medium mt-0.5">
          {new Date(meal.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          {meal.nutrition?.protein > 0 && ` · ${Math.round(meal.nutrition.protein)}g protein`}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <div className="font-display font-extrabold text-xl text-slate-800 leading-none">{cals}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">kcal</div>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all disabled:opacity-40">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
export default function Dashboard() {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

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
      fiber:    acc.fiber    + (n.fiber    || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const goals = user?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30, water: 2500 };
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  const remainingMacros = {
    calories: Math.max((goals.calories || 2000) - nutrition.calories, 0),
    protein:  Math.max((goals.protein  || 150)  - nutrition.protein,  0),
    carbs:    Math.max((goals.carbs    || 250)   - nutrition.carbs,   0),
    fat:      Math.max((goals.fat      || 65)    - nutrition.fat,     0),
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDate = (s) => {
    const d = new Date(s), now = new Date();
    const diff = Math.round((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-[fadeInUp_0.5s_ease-out_both]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display text-4xl font-extrabold text-slate-800 tracking-tight leading-none">
            {isToday ? `Good ${greeting()},` : formatDate(selectedDate)}
          </h1>
          {isToday && (
            <span className="font-display text-4xl font-extrabold text-blue-500 tracking-tight">
              {' '}{user?.name?.split(' ')[0]}!
            </span>
          )}
        </div>

        {/* Date navigator */}
        <div className="flex items-center gap-1.5 bg-white rounded-full px-2 py-1.5 shadow-sm border border-slate-100 self-start sm:self-auto">
          <button onClick={() => changeDate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-3 text-sm font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            {formatDate(selectedDate)}
          </div>
          <button onClick={() => changeDate(1)} disabled={isToday}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday && (
            <button onClick={() => setSelectedDate(today)} className="ml-1 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full hover:bg-blue-600 transition-colors">
              Today
            </button>
          )}
        </div>
      </div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Calorie Ring Card */}
        <div className="lg:col-span-4 bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-800">Calories</h2>
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <CalorieArc value={nutrition.calories} goal={goals.calories} />
        </div>

        {/* Macros Card */}
        <div className="lg:col-span-4 bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-800">Macros</h2>
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="flex flex-col gap-5 flex-1 justify-center">
            <MacroBar label="Protein" value={nutrition.protein} goal={goals.protein} colorClass="bg-blue-400" />
            <MacroBar label="Carbs"   value={nutrition.carbs}   goal={goals.carbs}   colorClass="bg-amber-400" />
            <MacroBar label="Fats"    value={nutrition.fat}     goal={goals.fat}     colorClass="bg-purple-400" />
            <MacroBar label="Fiber"   value={nutrition.fiber}   goal={goals.fiber}   colorClass="bg-green-400" />
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="lg:col-span-4 bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-800">Today's Stats</h2>
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { label: 'Meals',    value: meals.length,                                                                          unit: 'logged',        color: 'bg-blue-50 text-blue-700'   },
              { label: 'Streak',   value: user?.streak || 0,                                                                     unit: 'days',          color: 'bg-amber-50 text-amber-700' },
              { label: 'Protein',  value: `${Math.round(nutrition.protein)}g`,                                                   unit: `of ${goals.protein}g`, color: 'bg-green-50 text-green-700' },
              { label: 'Progress', value: `${Math.min(Math.round((nutrition.calories / goals.calories) * 100), 100)}%`,         unit: 'of goal',       color: 'bg-purple-50 text-purple-700' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className={`${color} rounded-2xl p-4 flex flex-col justify-between`}>
                <div className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</div>
                <div className="font-display font-extrabold text-2xl mt-2 leading-none">{value}</div>
                <div className="text-xs font-semibold opacity-60 mt-1">{unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Water Tracker */}
        <WaterTracker isToday={isToday} waterGoal={goals.water} />

        {/* AI Recipe Card */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.18)] flex flex-col gap-4 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="flex items-start justify-between relative">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">AI Chef</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white leading-tight">What should I eat?</h2>
              <p className="text-slate-400 font-medium text-sm mt-2 max-w-xs">
                {remainingMacros.calories > 0
                  ? `You still have ~${Math.round(remainingMacros.calories)} kcal left for today. Let Gemini AI suggest the perfect recipe to hit your targets.`
                  : "You've already hit your calorie goal today. Great work! 🎉"}
              </p>
            </div>
          </div>

          {/* Remaining macro pills */}
          {remainingMacros.calories > 0 && (
            <div className="flex flex-wrap gap-2 relative">
              {[
                { label: 'Calories', value: `${Math.round(remainingMacros.calories)} kcal`, bg: 'bg-white/10 text-white' },
                { label: 'Protein',  value: `${Math.round(remainingMacros.protein)}g`,       bg: 'bg-purple-500/20 text-purple-300' },
                { label: 'Carbs',    value: `${Math.round(remainingMacros.carbs)}g`,         bg: 'bg-amber-500/20 text-amber-300' },
                { label: 'Fat',      value: `${Math.round(remainingMacros.fat)}g`,           bg: 'bg-pink-500/20 text-pink-300' },
              ].map(({ label, value, bg }) => (
                <div key={label} className={`${bg} rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5`}>
                  <span className="opacity-60">{label}</span> {value}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => remainingMacros.calories > 0 && setShowRecipeModal(true)}
            disabled={remainingMacros.calories <= 0}
            className="w-fit flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-extrabold text-sm shadow-lg hover:bg-slate-100 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Suggest a Recipe
          </button>
        </div>

        {/* Meals List — full width */}
        <div className="lg:col-span-12 bg-white rounded-[28px] p-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-800">
                Meals Logged
                {meals.length > 0 && <span className="ml-2 text-sm font-semibold text-slate-400">({meals.length})</span>}
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-0.5">
                {isToday ? "Here's what you've eaten today" : formatDate(selectedDate)}
              </p>
            </div>
            <Link to="/log"
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200">
              <Plus className="w-4 h-4" />
              Log Meal
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 skeleton rounded-2xl" />
              ))}
            </div>
          ) : meals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-inner">🍽️</div>
              <div className="font-display font-bold text-xl text-slate-700 mb-2">Nothing logged yet</div>
              <div className="text-slate-400 text-sm max-w-xs mb-6">Snap a photo of your food and let AI calculate your calories and macros instantly.</div>
              {isToday && (
                <Link to="/log" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow hover:-translate-y-0.5 transition-transform">
                  Log your first meal
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {meals.map(meal => (
                <MealCard key={meal._id} meal={meal} onDelete={id => setMeals(prev => prev.filter(m => m._id !== id))} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recipe Modal */}
      {showRecipeModal && (
        <RecipeModal remainingMacros={remainingMacros} onClose={() => setShowRecipeModal(false)} />
      )}
    </div>
  );
}
