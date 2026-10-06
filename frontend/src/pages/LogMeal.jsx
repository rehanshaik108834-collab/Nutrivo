import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';
import { Camera, Upload, X, CheckCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const STAGES = { idle: 'idle', uploading: 'uploading', analyzing: 'analyzing', result: 'result' };

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅', color: 'bg-amber-50 border-amber-200 text-amber-700', active: 'bg-amber-400 border-amber-400 text-white' },
  { id: 'lunch',     label: 'Lunch',     emoji: '☀️',  color: 'bg-blue-50 border-blue-200 text-blue-700',   active: 'bg-blue-400 border-blue-400 text-white' },
  { id: 'dinner',    label: 'Dinner',    emoji: '🌙',  color: 'bg-purple-50 border-purple-200 text-purple-700', active: 'bg-purple-400 border-purple-400 text-white' },
  { id: 'snack',     label: 'Snack',     emoji: '🍎',  color: 'bg-green-50 border-green-200 text-green-700', active: 'bg-green-400 border-green-400 text-white' },
];

function autoMealType() {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 19) return 'dinner';
  return 'snack';
}

export default function LogMeal() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [stage, setStage] = useState(STAGES.idle);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState(autoMealType());
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { setError('Please upload an image file'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        let { width, height } = img;
        if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImage({ data: compressedDataUrl.split(',')[1], mime: 'image/jpeg', preview: compressedDataUrl });
        setStage(STAGES.uploading);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const handleAnalyze = async () => {
    if (!image) return;
    setStage(STAGES.analyzing); setError('');
    try {
      const { data } = await axios.post(`${API}/meals`, { imageData: image.data, imageMimeType: image.mime, mealType, loggedAt: new Date().toISOString() });
      setResult(data); setStage(STAGES.result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Analysis failed. Please try again.');
      setStage(STAGES.uploading);
    }
  };

  const reset = () => { setStage(STAGES.idle); setImage(null); setResult(null); setError(''); };

  if (stage === STAGES.result && result) {
    return <ResultView meal={result.meal} onDone={() => navigate('/')} onAnother={reset} />;
  }

  return (
    <div className="max-w-2xl mx-auto animate-[fadeInUp_0.5s_ease-out_both]">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Log a Meal</h1>
        <p className="text-slate-500 font-medium">Snap a photo — our AI identifies every food and calculates nutrition instantly.</p>
      </div>

      {/* Meal Type Selector */}
      <div className="mb-8">
        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Meal Type</label>
        <div className="grid grid-cols-4 gap-3">
          {MEAL_TYPES.map(({ id, label, emoji, color, active }) => (
            <button key={id} onClick={() => setMealType(id)}
              className={`flex flex-col items-center gap-2 py-4 rounded-[20px] border-2 font-bold text-sm transition-all duration-200 hover:scale-[1.03] ${mealType === id ? active : color}`}>
              <span className="text-2xl">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload / Preview Area */}
      {(stage === STAGES.idle || stage === STAGES.uploading) && (
        <div>
          {!image ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileRef.current?.click()}
              className={`relative rounded-[28px] border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-5
                ${dragging ? 'border-blue-400 bg-blue-50 scale-[1.01]' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}`}
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${dragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <Camera className={`w-9 h-9 ${dragging ? 'text-blue-500' : 'text-slate-400'}`} />
              </div>
              <div>
                <div className="font-display font-bold text-xl text-slate-700 mb-2">
                  {dragging ? 'Drop it here!' : 'Drop your photo here'}
                </div>
                <div className="text-slate-400 text-sm font-medium">or click to browse · JPG, PNG, WEBP</div>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:-translate-y-0.5 transition-transform">
                <Upload className="w-4 h-4" />
                Choose Photo
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => processFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] border border-slate-100">
              <div className="relative">
                <img src={image.preview} alt="Meal" className="w-full max-h-80 object-cover" />
                <button onClick={reset} className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-bold text-slate-700">Photo ready</span>
                </div>
              </div>
              <div className="p-6">
                {error && <div className="bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mb-4 border border-red-100">{error}</div>}
                <button onClick={handleAnalyze}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Analyze with AI
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analyzing State */}
      {stage === STAGES.analyzing && (
        <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] border border-slate-100 text-center p-12">
          <div className="relative w-full mb-8">
            <img src={image.preview} alt="Meal" className="w-full max-h-52 object-cover rounded-2xl opacity-40 blur-[2px]" />
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-800 mb-2">Analyzing your meal…</h2>
          <p className="text-slate-500 font-medium mb-8">Our AI is identifying every food item and computing your macros</p>
          <div className="flex justify-center gap-8">
            {['Detecting foods', 'Estimating portions', 'Calculating macros'].map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-2 text-xs font-bold text-slate-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultView({ meal, onDone, onAnother }) {
  const n = meal.nutrition || {};
  return (
    <div className="max-w-2xl mx-auto animate-[fadeInUp_0.5s_ease-out_both]">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-800 leading-none">Meal Logged!</h1>
          <p className="text-slate-500 font-medium mt-1">Added to your daily tracker.</p>
        </div>
        <div className="ml-auto bg-green-50 border border-green-100 text-green-700 text-sm font-bold px-3 py-1.5 rounded-full">
          {meal.aiConfidence}% confidence
        </div>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] border border-slate-100 mb-5">
        <div className="relative">
          <img src={`data:${meal.imageMimeType};base64,${meal.imageData}`} alt={meal.name} className="w-full h-56 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h2 className="font-display text-2xl font-extrabold text-white">{meal.name}</h2>
            {meal.description && <p className="text-white/80 text-sm font-medium mt-1">{meal.description}</p>}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-display font-extrabold text-6xl text-slate-800">{Math.round(n.calories || 0)}</span>
            <span className="text-xl text-slate-400 font-semibold">kcal</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Protein', value: n.protein, color: 'bg-blue-50 text-blue-700' },
              { label: 'Carbs',   value: n.carbs,   color: 'bg-amber-50 text-amber-700' },
              { label: 'Fat',     value: n.fat,     color: 'bg-purple-50 text-purple-700' },
              { label: 'Fiber',   value: n.fiber,   color: 'bg-green-50 text-green-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} rounded-2xl p-3 text-center`}>
                <div className="font-display font-extrabold text-xl">{Math.round(value || 0)}<span className="text-xs font-bold">g</span></div>
                <div className="text-xs font-bold uppercase tracking-wider opacity-70 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detected foods */}
      {meal.foods?.length > 0 && (
        <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-100 mb-5">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Detected Foods</div>
          <div className="flex flex-col gap-1">
            {meal.foods.map((food, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                <div>
                  <div className="font-bold text-slate-700">{food.name}</div>
                  <div className="text-xs text-slate-400 font-medium">{food.portion}</div>
                </div>
                <div className="font-extrabold text-slate-800">{Math.round(food.nutrition?.calories || 0)}<span className="text-slate-400 font-semibold text-xs ml-1">kcal</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {meal.aiNotes && (
        <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-4 mb-5 text-sm font-medium">
          <span className="font-bold">AI Note: </span>{meal.aiNotes}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onAnother} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors">
          Log Another
        </button>
        <button onClick={onDone} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-700 hover:-translate-y-0.5 transition-all shadow-md">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
