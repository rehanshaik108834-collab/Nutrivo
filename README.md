<div align="center">
  <img src="frontend/public/logo192.png" alt="Nutrivo Logo" width="120" />

  <h1>🥗 Nutrivo</h1>
  
  <p><strong>Snap a photo. Get your macros. Track everything effortlessly.</strong></p>

  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react" alt="React" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-Backend-green.svg?style=flat-square&logo=node.js" alt="Node" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Database-47A248.svg?style=flat-square&logo=mongodb" alt="MongoDB" /></a>
    <a href="https://groq.com/"><img src="https://img.shields.io/badge/AI-Groq%20Vision-orange.svg?style=flat-square" alt="Groq Vision" /></a>
  </p>
</div>

<br />

Nutrivo is a premium, AI-powered nutrition tracking application. Instead of manually searching for foods and estimating portion sizes, simply upload a photo of your meal. Nutrivo uses state-of-the-art **Llama 3 Vision AI via Groq** to instantly analyze your food, extract precise nutritional data, and log it to your daily goals.

---

## ✨ Key Features

- **📸 AI Photo Analysis**: Upload any meal photo, and our Vision AI will identify all food items, estimate portion sizes, and calculate exact calories, protein, carbs, fat, fiber, and more.
- **🎨 Premium UI/UX**: A stunning, modern, glassmorphism-inspired design with buttery smooth animations, interactive charts, and full Light/Dark mode support.
- **📊 Advanced Analytics**: Visualize your nutrition journey with beautiful weekly and monthly charts. Track your daily streaks and see average macro breakdowns.
- **🎯 Personalized Goals**: Set custom daily targets for calories and all major macronutrients based on your personal fitness goals (lose, maintain, or gain weight).
- **🔒 Secure Authentication**: Full user account system with JWT-based authentication to keep your health data private and secure.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Modern UI framework
- **Vanilla CSS** — Custom premium styling with CSS Variables and Light/Dark themes
- **Recharts** — Interactive, animated data visualization
- **Framer Motion** — Smooth micro-animations and page transitions
- **React Dropzone** — Seamless drag-and-drop image uploads

### Backend
- **Node.js & Express** — High-performance RESTful API
- **MongoDB (Mongoose)** — Flexible, scalable NoSQL database
- **Groq SDK** — Lightning-fast AI inference using Llama Vision models
- **JWT & Bcrypt** — Secure user authentication and password hashing
- **Multer** — Handling image processing streams

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- Local MongoDB instance (or MongoDB Atlas URI)
- [Groq API Key](https://console.groq.com) (Free)

### 2. Clone the Repository
```bash
git clone https://github.com/rehanshaik108834-collab/Nutrivo.git
cd Nutrivo
```

### 3. Backend Setup
```bash
cd backend
npm install

# Create environment variables file
cp .env.example .env
```
Edit the `.env` file and add your credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutrivo
JWT_SECRET=your_super_secret_key_here
GROQ_API_KEY=gsk_your_api_key_here
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
npm start
```
The application will launch at `http://localhost:3000`.

---

## 🌍 Production Deployment

Nutrivo is perfectly configured for modern cloud deployment. 

### 1. Backend (HuggingFace Spaces - Docker)
1. Create a new Space on [HuggingFace](https://huggingface.co/spaces) (Docker SDK).
2. Push the `/backend` directory to your Space.
3. Add your environment variables (`MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `CLIENT_URL`) as Secrets in the Space Settings.
4. The included `Dockerfile` and `README.md` metadata will automatically build and run your API on port 7860.

### 2. Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set the Root Directory to `frontend`.
3. Add the `REACT_APP_API_URL` environment variable pointing to your HuggingFace Space URL (e.g., `https://your-space-name.hf.space/api`).
4. Click Deploy.

---

## 🤖 AI Prompt Engineering

Nutrivo utilizes a highly structured prompt to guide the Vision AI:
1. Identify all visible ingredients.
2. Estimate absolute weights/portions based on plate sizing context.
3. Enforce a strict JSON output schema.
4. Calculate comprehensive macro and micronutrients.
5. Provide an AI Confidence Score (0-100) based on image clarity.

---

<div align="center">
  <p>Built with ❤️ by Rehan</p>
</div>
