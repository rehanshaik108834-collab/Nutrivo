import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API, useAuth } from '../context/AuthContext';
import MacroRing from '../components/MacroRing';

const MEAL_COLORS = { breakfast: 'var(--amber)', lunch: 'var(--blue)', dinner: 'var(--purple)', snack: 'var(--teal)' };
const MEAL_EMOJIS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

function CalorieBar({ value, goal }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  const over = value > goal;
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, fontWeight: 600 }}>
        <span style={{ color: 'var(--text)' }}>{Math.round(value)} kcal consumed</span>
        <span style={{ color: over ? 'var(--coral)' : 'var(--text3)' }}>{goal} kcal goal</span>
      </div>
      <div style={{ height: 12, background: 'var(--bg3)', borderRadius: 6, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 6, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          background: over ? 'var(--coral)' : 'linear-gradient(90deg, var(--lime), var(--teal))',
          boxShadow: '0 0 10px rgba(255,255,255,0.2)'
        }} />
      </div>
      <div style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: over ? 'var(--coral)' : 'var(--text2)' }}>
        {over ? `${Math.round(value - goal)} kcal over` : `${Math.round(goal - value)} kcal remaining`}
      </div>
    </div>
  );
}

function MealCard({ meal, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this meal?')) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/meals/${meal._id}`);
      onDelete(meal._id);
    } catch { setDeleting(false); }
  };

  return (
    <div className="card card-hover" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', marginBottom: 12 }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Image */}
        <div style={{ width: 100, flexShrink: 0, background: 'var(--bg3)', position: 'relative' }}>
          <img src={`data:${meal.imageMimeType};base64,${meal.imageData}`} alt={meal.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display='none'; }} />
          <div style={{
            position: 'absolute', top: 8, left: 8, background: MEAL_COLORS[meal.mealType] || 'var(--border2)',
            borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 800, color: '#fff', textTransform: 'uppercase',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>{meal.mealType}</div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{meal.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4, fontWeight: 500 }}>
                {new Date(meal.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {meal.aiConfidence && <span style={{ marginLeft: 12, color: 'var(--lime-dim)', fontWeight: 600 }}>
                  ✓ {meal.aiConfidence}% match
                </span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--lime-dim)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                {Math.round(meal.nutrition?.calories || 0)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginTop: 4 }}>kcal</div>
            </div>
          </div>

          {/* Macro pills */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              ['Protein', meal.nutrition?.protein || 0, 'var(--blue)'],
              ['Carbs', meal.nutrition?.carbs || 0, 'var(--amber)'],
              ['Fat', meal.nutrition?.fat || 0, 'var(--purple)'],
            ].map(([l, v, c]) => (
              <span key={l} style={{
                fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                background: 'var(--surface2)', color: c, border: '1px solid var(--border)'
              }}>{Math.round(v)}g {l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          {meal.description && <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>{meal.description}</p>}
          {meal.foods?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detected Components</div>
              <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {meal.foods.map((food, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i === meal.foods.length - 1 ? 'none' : '1px solid var(--border)', fontSize: 14 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{food.name} <span style={{ color: 'var(--text3)', fontSize: 13, marginLeft: 4 }}>({food.portion})</span></span>
                    <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{Math.round(food.nutrition?.calories || 0)} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {meal.aiNotes && <div style={{ background: 'var(--lime-glow2)', border: '1px solid var(--lime-glow)', borderRadius: 8, padding: '12px', color: 'var(--text)', fontSize: 13, marginBottom: 16 }}>
            <strong style={{ color: 'var(--lime-dim)' }}>AI Note:</strong> {meal.aiNotes}
          </div>}
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting} style={{ fontSize: 13, padding: '10px 20px', borderRadius: 8 }}>
            {deleting ? 'Removing...' : 'Delete Meal'}
          </button>
        </div>
      )}
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

  const mealsByType = meals.reduce((acc, m) => {
    if (!acc[m.mealType]) acc[m.mealType] = [];
    acc[m.mealType].push(m);
    return acc;
  }, {});

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
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
            {isToday ? `Good ${getGreeting()}, ` : formatDate(selectedDate)}
            {isToday && <span className="gradient-text">{user?.name?.split(' ')[0]}</span>}
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 16, fontWeight: 500 }}>
            {isToday ? "Here's your nutrition overview for today." : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {user?.streak > 0 && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>🔥</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--lime-dim)', lineHeight: 1 }}>{user.streak}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Day Streak</div>
            </div>
          </div>
        )}
      </div>

      {/* Date nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button className="btn-ghost" onClick={() => changeDate(-1)} style={{ padding: '8px 16px' }}>← Prev</button>
        <span style={{ fontSize: 16, color: 'var(--text)', fontWeight: 700, minWidth: 100, textAlign: 'center' }}>{formatDate(selectedDate)}</span>
        <button className="btn-ghost" onClick={() => changeDate(1)} disabled={isToday} style={{ padding: '8px 16px', opacity: isToday ? 0.4 : 1 }}>Next →</button>
        {!isToday && (
          <button className="btn-lime" onClick={() => setSelectedDate(today)} style={{ padding: '8px 16px', marginLeft: 'auto' }}>Go to Today</button>
        )}
      </div>

      {/* Calorie card */}
      <div className="glass-panel" style={{ marginBottom: 40, padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>Energy Overview</div>
            <CalorieBar value={nutrition.calories} goal={goals.calories} />
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            <MacroRing value={nutrition.protein} goal={goals.protein} color="var(--blue)" label="Protein" />
            <MacroRing value={nutrition.carbs} goal={goals.carbs} color="var(--amber)" label="Carbs" />
            <MacroRing value={nutrition.fat} goal={goals.fat} color="var(--purple)" label="Fat" />
            <MacroRing value={nutrition.fiber} goal={goals.fiber || 30} color="var(--teal)" label="Fiber" />
          </div>
        </div>
      </div>

      {/* Meals */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
          Your Meals {meals.length > 0 && <span style={{ color: 'var(--text3)', fontWeight: 500, fontSize: 16, marginLeft: 8 }}>({meals.length})</span>}
        </h2>
        <Link to="/log" className="btn btn-lime" style={{ borderRadius: 12 }}>
          <span style={{ fontSize: 18, marginRight: 6 }}>+</span> Log Meal
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--r-lg)' }} />)}
        </div>
      ) : meals.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }}>🍽️</div>
          <div style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>No meals logged {isToday ? 'yet' : 'on this day'}</div>
          <div style={{ color: 'var(--text2)', fontSize: 16, marginBottom: 32, maxWidth: 400 }}>Snap a photo of your food, and our AI will automatically calculate the calories and macros for you.</div>
          {isToday && <Link to="/log" className="btn btn-lime" style={{ padding: '14px 32px', fontSize: 16 }}>Log your first meal</Link>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
            const typeMeals = mealsByType[type];
            if (!typeMeals?.length) return null;
            return (
              <div key={type}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingLeft: 8 }}>
                  <span style={{ fontSize: 20 }}>{MEAL_EMOJIS[type]}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', textTransform: 'capitalize', letterSpacing: '0.5px' }}>{type}</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border2), transparent)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {typeMeals.map(meal => (
                    <MealCard key={meal._id} meal={meal} onDelete={id => setMeals(prev => prev.filter(m => m._id !== id))} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
