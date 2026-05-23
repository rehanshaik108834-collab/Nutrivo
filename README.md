# 🥗 Nutrivo — AI-Powered Nutrition Tracker

> Snap a photo. Get your macros. Track everything.

Nutrivo uses Claude's vision AI to analyze meal photos and extract nutritional data — calories, protein, carbs, fat, and more — automatically.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Recharts, React Router v6 |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI | Anthropic Claude (vision) |
| Auth | JWT |

---

## Project Structure

```
nutrivo/
├── backend/
│   ├── models/         # User, Meal schemas
│   ├── routes/         # auth, meals, analytics, users
│   ├── middleware/     # JWT auth
│   └── server.js
└── frontend/
    └── src/
        ├── pages/      # Dashboard, LogMeal, Analytics, Profile, AuthPage
        ├── components/ # Layout, MacroRing, Toast
        └── context/    # AuthContext (global auth + API)
```

---

## Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- Anthropic API key

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY and MONGODB_URI
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

---

## Environment Variables

```env
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutrivo
JWT_SECRET=your_super_secret_key_here
GROQ_API_KEY=gsk_...
CLIENT_URL=http://localhost:3000
```

---

## Features

### 🤖 AI Meal Analysis
- Upload or take a photo of any meal
- Claude vision model identifies all food items
- Estimates portions from visual cues
- Returns: calories, protein, carbs, fat, fiber, sugar, sodium, cholesterol
- Confidence score per analysis

### 📊 Dashboard
- Today's calorie progress bar
- Macro rings (protein, carbs, fat, fiber)
- Meals grouped by type (breakfast/lunch/dinner/snack)
- Date navigation to view past days
- Streak counter

### 📈 Analytics
- Weekly 7-day charts (area + bar)
- Monthly breakdown with pie chart
- Average macro calculations
- Goal percentage tracking
- Meal type distribution

### 👤 Profile
- Nutrition goal sliders (calories, protein, carbs, fat, fiber)
- Macro split preview
- Personal info (age, weight, height, activity level, goal)

---

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/signin` — Login
- `GET  /api/auth/me` — Current user

### Meals
- `POST /api/meals` — Log meal (with image base64)
- `GET  /api/meals/today` — Today's meals
- `GET  /api/meals/date/:date` — Meals for date (YYYY-MM-DD)
- `DELETE /api/meals/:id` — Delete meal

### Analytics
- `GET /api/analytics/weekly` — Last 7 days
- `GET /api/analytics/monthly?month=&year=` — Monthly data
- `GET /api/analytics/daily/:date` — Single day
- `GET /api/analytics/streak` — User streak

### Users
- `PATCH /api/users/goals` — Update nutrition goals
- `PATCH /api/users/profile` — Update personal info

---

## AI Prompt Design

The meal analysis uses a structured prompt that instructs Claude to:
1. Identify all visible food items
2. Estimate portions from plate size / visual context
3. Return a strict JSON schema with per-food breakdown
4. Assign a confidence score based on image clarity
5. Include notes if estimation quality is limited

---

## Production Deployment

### Backend (Railway / Render / Fly.io)
Set environment variables in your hosting dashboard.

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy /build folder
```
Set `REACT_APP_API_URL=https://your-backend.com/api` in frontend env.

### MongoDB
Use MongoDB Atlas free tier for production.
