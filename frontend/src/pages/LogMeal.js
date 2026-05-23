import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';

const STAGES = {
  idle: 'idle',
  uploading: 'uploading',
  analyzing: 'analyzing',
  result: 'result',
  saving: 'saving'
};

export default function LogMeal() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [stage, setStage] = useState(STAGES.idle);
  const [image, setImage] = useState(null); // { data, mime, preview }
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState(autoMealType());

  function autoMealType() {
    const h = new Date().getHours();
    if (h < 10) return 'breakfast';
    if (h < 14) return 'lunch';
    if (h < 19) return 'dinner';
    return 'snack';
  }

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { setError('Please upload an image file'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result.split(',')[1];
      setImage({ data, mime: file.type, preview: e.target.result });
      setStage(STAGES.uploading);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, []);

  const handleAnalyze = async () => {
    if (!image) return;
    setStage(STAGES.analyzing);
    setError('');
    try {
      const { data } = await axios.post(`${API}/meals`, {
        imageData: image.data,
        imageMimeType: image.mime,
        mealType,
        loggedAt: new Date().toISOString()
      });
      setResult(data);
      setStage(STAGES.result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Analysis failed. Please try again.');
      setStage(STAGES.uploading);
    }
  };

  const reset = () => {
    setStage(STAGES.idle);
    setImage(null);
    setResult(null);
    setError('');
  };

  if (stage === STAGES.result && result) {
    return <ResultView meal={result.meal} analysis={result.analysis} onDone={() => navigate('/')} onAnother={reset} />;
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Log a Meal</h1>
        <p style={{ color: 'var(--text3)', fontSize: 16, fontWeight: 500 }}>Take or upload a photo — our AI will identify nutrients automatically.</p>
      </div>

      {/* Meal type selector */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 700, display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meal Type</label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['breakfast','lunch','dinner','snack'].map(t => (
            <button key={t} onClick={() => setMealType(t)}
              style={{
                flex: 1, minWidth: 100, padding: '16px 8px', borderRadius: 16, border: '1px solid',
                cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
                background: mealType === t ? `var(--${t === 'breakfast' ? 'amber' : t === 'lunch' ? 'blue' : t === 'dinner' ? 'purple' : 'teal'})` : 'var(--surface)',
                borderColor: mealType === t ? 'transparent' : 'var(--border)',
                color: mealType === t ? '#fff' : 'var(--text)',
                textTransform: 'capitalize',
                boxShadow: mealType === t ? `0 4px 12px var(--${t === 'breakfast' ? 'amber' : t === 'lunch' ? 'blue' : t === 'dinner' ? 'purple' : 'teal'})40` : 'none'
              }}>
              <div style={{ fontSize: 24, marginBottom: 8, filter: mealType !== t ? 'grayscale(1)' : 'none', opacity: mealType !== t ? 0.6 : 1 }}>{MEAL_EMOJI[t]}</div>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Upload area */}
      {(stage === STAGES.idle || stage === STAGES.uploading) && (
        <div>
          {!image ? (
            <div
              onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--border2)', borderRadius: 24, padding: '80px 40px',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'var(--surface2)', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lime)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 80, height: 80, background: 'var(--lime-glow2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 24, border: '1px solid var(--lime-glow)' }}>📷</div>
              <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Drop photo here or click to upload</div>
              <div style={{ color: 'var(--text3)', fontSize: 14, fontWeight: 500 }}>JPG, PNG, WEBP supported</div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                onChange={e => processFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img src={image.preview} alt="Meal" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
                <button onClick={reset} style={{
                  position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                  border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36,
                  cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }} onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.8)'} onMouseLeave={e => e.currentTarget.style.background='rgba(0,0,0,0.6)'}>×</button>
              </div>
              <div style={{ padding: '24px 32px' }}>
                <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--lime-dim)' }}>✓</span> Image ready for analysis
                </div>
                {error && <div style={{ color: 'var(--coral)', fontSize: 14, fontWeight: 500, marginBottom: 16, background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: 8 }}>{error}</div>}
                <button className="btn btn-lime" onClick={handleAnalyze} style={{ width: '100%', padding: '16px', borderRadius: 12, fontSize: 16, marginTop: 12 }}>
                  🔍 Analyze with AI
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analyzing state */}
      {stage === STAGES.analyzing && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
          <img src={image.preview} alt="Meal" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 16, marginBottom: 32, opacity: 0.5, filter: 'blur(2px)' }} />
          
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(var(--bg-rgb), 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Analyzing your meal...</div>
            <div style={{ color: 'var(--text3)', fontSize: 15, fontWeight: 500 }}>Our AI is identifying foods and calculating nutrition</div>
            
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 40 }}>
              {['Detecting foods', 'Estimating portions', 'Calculating macros'].map((s, i) => (
                <div key={s} style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, textAlign: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--lime)', margin: '0 auto 8px', animation: `pulse-lime 1.5s ease ${i * 0.4}s infinite` }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultView({ meal, analysis, onDone, onAnother }) {
  const n = meal.nutrition || {};
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: 'var(--lime)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 20, boxShadow: '0 4px 12px var(--lime-glow)' }}>✓</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>Meal Logged!</h1>
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 16, fontWeight: 500 }}>Successfully added to your daily tracker.</p>
        </div>
        <div style={{ background: 'var(--surface)', padding: '8px 16px', borderRadius: 100, border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
          AI Confidence: <span style={{ color: 'var(--lime-dim)' }}>{meal.aiConfidence}%</span>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
             <img src={`data:${meal.imageMimeType};base64,${meal.imageData}`} alt={meal.name}
              style={{ width: '100%', height: '100%', minHeight: 240, objectFit: 'cover', display: 'block' }} />
             <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px 20px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{meal.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>{meal.description}</div>
             </div>
          </div>
          
          <div style={{ flex: '1 1 300px', padding: '32px' }}>
            <div style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Nutrition Summary</div>
            
            {/* Big calorie */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 800, color: 'var(--lime-dim)', lineHeight: 1 }}>{Math.round(n.calories || 0)}</div>
              <div style={{ color: 'var(--text2)', fontSize: 18, fontWeight: 600 }}>kcal</div>
            </div>

            {/* Macros grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                ['Protein', n.protein, 'var(--blue)'],
                ['Carbs', n.carbs, 'var(--amber)'],
                ['Fat', n.fat, 'var(--purple)'],
                ['Fiber', n.fiber, 'var(--teal)'],
              ].map(([label, val, color]) => (
                <div key={label} style={{ background: 'var(--surface)', borderRadius: 12, padding: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color }}>{Math.round(val || 0)}<span style={{ fontSize: 14 }}>g</span></div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Foods breakdown */}
      {meal.foods?.length > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: '24px' }}>
          <div style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Foods Detected</div>
          <div style={{ background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {meal.foods.map((food, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i < meal.foods.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 16, color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>{food.name}</div>
                  <div style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 500 }}>{food.portion}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--lime-dim)' }}>{Math.round(food.nutrition?.calories || 0)} <span style={{ fontSize: 13, color: 'var(--text3)' }}>kcal</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {meal.aiNotes && (
        <div style={{ background: 'var(--lime-glow2)', border: '1px solid var(--lime-glow)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
          <strong style={{ color: 'var(--lime-dim)', marginRight: 8 }}>⚡ AI Note:</strong> {meal.aiNotes}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16 }}>
        <button className="btn btn-ghost" onClick={onAnother} style={{ flex: 1, padding: '16px', fontSize: 16 }}>Log Another Meal</button>
        <button className="btn btn-lime" onClick={onDone} style={{ flex: 1, padding: '16px', fontSize: 16 }}>Back to Dashboard</button>
      </div>
    </div>
  );
}

const MEAL_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
