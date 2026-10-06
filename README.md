<div align="center">
  <h1>🥗 Nutrivo</h1>
  
  <p><strong>Snap a photo. Get your macros. Track everything effortlessly.</strong></p>

  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF.svg?style=flat-square&logo=vite" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat-square&logo=tailwind-css" alt="Tailwind" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-Backend-green.svg?style=flat-square&logo=node.js" alt="Node" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Database-47A248.svg?style=flat-square&logo=mongodb" alt="MongoDB" /></a>
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/AI-Google%20Gemini%20Vision-blue.svg?style=flat-square" alt="Gemini Vision" /></a>
  </p>
</div>

<br />

Nutrivo is a premium, AI-powered nutrition tracking application. Instead of manually searching for foods and estimating portion sizes, simply upload a photo of your meal. Nutrivo uses state-of-the-art **Google Gemini Vision AI** to instantly analyze your food, extract precise nutritional data, and log it to your daily goals.

---

## ✨ Key Features

- **📸 AI Photo Analysis**: Upload any meal photo, and our Gemini Vision AI will identify all food items, estimate portion sizes, and calculate exact calories, protein, carbs, fat, fiber, and more.
- **🎨 Premium Bento UI**: A stunning, modern, bento-box-inspired design built with Tailwind CSS, featuring buttery smooth micro-animations and interactive SVG data charts.
- **📊 Advanced Analytics**: Visualize your nutrition journey with beautiful weekly and monthly area charts, daily bar charts, and macro-split pie charts using Recharts.
- **🎯 Personalized Goals**: Set custom daily targets for calories and all major macronutrients based on your personal fitness goals.
- **🔒 Secure Authentication**: Full user account system with JWT-based authentication to keep your health data private and secure.

---

## 🛠️ Tech Stack

### Frontend
- **React 18 & Vite** — Blazing fast modern UI framework and bundler
- **Tailwind CSS** — Utility-first styling for the premium light-mode bento aesthetic
- **Recharts** — Interactive, animated data visualization
- **Lucide React** — Crisp, professional iconography

### Backend
- **Node.js & Express** — High-performance RESTful API
- **MongoDB (Mongoose)** — Flexible, scalable NoSQL database
- **Google Generative AI SDK** — Lightning-fast AI inference using Gemini Vision models
- **JWT & Bcrypt** — Secure user authentication and password hashing

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- Local MongoDB instance (or MongoDB Atlas URI)
- [Google Gemini API Key](https://aistudio.google.com/) (Free)

### 2. Clone the Repository
```bash
git clone https://github.com/rehanshaik108834-collab/Nutrivo.git
cd Nutrivo
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit the backend `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutrivo
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3000
```
Start the backend server:
```bash
npm run dev
```

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the frontend folder if needed, or rely on defaults:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the Vite dev server:
```bash
npm run dev
```
The application will launch at `http://localhost:3000` (or `http://localhost:5173`).

---

## 🐳 Docker Support

You can run the entire stack (MongoDB, Backend, Frontend) with a single command:
```bash
docker-compose up --build
```
Ensure your `backend/.env` file is configured correctly first!

---

## 🌍 Production Deployment

Nutrivo is configured for modern cloud deployment.

### 1. Backend
- Deploy your backend to any Docker-supported host (Render, Fly.io, etc.).
- Ensure environment variables are set.

### 2. Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set the Framework Preset to **Vite**.
3. Add the `VITE_API_URL` environment variable pointing to your deployed backend URL.
4. Set the Root Directory to `frontend` and click Deploy.

---

<div align="center">
  <p>Built with ❤️</p>
</div>
