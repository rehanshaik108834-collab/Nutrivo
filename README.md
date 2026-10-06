<div align="center">
  <h1>🥗 Nutrivo</h1>
  
  <p><strong>Snap a photo. Get your macros. Track everything effortlessly.</strong></p>

  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF.svg?style=flat-square&logo=vite" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat-square&logo=tailwind-css" alt="Tailwind" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-Backend-green.svg?style=flat-square&logo=node.js" alt="Node" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Database-47A248.svg?style=flat-square&logo=mongodb" alt="MongoDB" /></a>
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/AI-Google%20Gemini%20Vision-blue.svg?style=flat-square&logo=google" alt="Gemini Vision" /></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Frontend-Vercel-black.svg?style=flat-square&logo=vercel" alt="Vercel" /></a>
    <a href="https://huggingface.co/spaces"><img src="https://img.shields.io/badge/Backend-Hugging%20Face%20Spaces-yellow.svg?style=flat-square&logo=huggingface" alt="Hugging Face Spaces" /></a>
  </p>
</div>

<br />

Nutrivo is a premium, AI-powered nutrition tracking application. Instead of manually searching for foods and estimating portion sizes, simply upload a photo of your meal. Nutrivo uses state-of-the-art **Google Gemini Vision AI** to instantly analyze your food, extract precise nutritional data, and log it to your daily goals. 

The application is engineered for modern cloud environments, seamlessly leveraging **Vercel** for lightning-fast frontend delivery and **Hugging Face Spaces (Docker SDK)** for robust backend hosting.

---

## ✨ Key Features

- **📸 AI Photo Analysis**: Upload any meal photo, and our Gemini Vision AI will identify all food items, estimate portion sizes, and calculate exact calories, protein, carbs, fat, fiber, and more.
- **🎨 Premium Light-Mode UI**: A stunning, modern, clean aesthetic built from the ground up with Tailwind CSS. Features buttery smooth micro-animations, glassmorphism elements, and fully responsive layouts.
- **📊 Advanced Analytics**: Visualize your nutrition journey with beautiful weekly and monthly area charts, daily bar charts, and macro-split pie charts using Recharts.
- **🎯 Personalized Goals**: Set custom daily targets for calories and all major macronutrients based on your personal fitness goals.
- **🔒 Secure Authentication**: Full user account system with JWT-based authentication to keep your health data private and secure.

---

## 🛠️ Tech Stack

### Frontend (Hosted on Vercel)
- **React 18 & Vite** — Blazing fast modern UI framework and bundler
- **Tailwind CSS** — Utility-first styling for the premium light-mode aesthetic
- **Recharts** — Interactive, animated data visualization
- **Lucide React** — Crisp, professional iconography
- **React Router v6** — Client-side routing

### Backend (Hosted on Hugging Face Spaces)
- **Node.js & Express** — High-performance RESTful API
- **MongoDB (Mongoose)** — Flexible, scalable NoSQL database
- **Google Generative AI SDK** — Lightning-fast AI inference using Gemini Vision models
- **JWT & Bcrypt** — Secure user authentication and password hashing
- **Multer** — Handling image processing streams

---

## 🚀 Local Development Guide

### 1. Prerequisites
- Node.js (v18+)
- Local MongoDB instance (or MongoDB Atlas URI)
- [Google Gemini API Key](https://aistudio.google.com/) (Free)
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/rehanshaik108834-collab/Nutrivo.git
cd Nutrivo
```

### 3. Backend Setup
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
cp .env.example .env
```
Edit the backend `.env` file to include your credentials:
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
*The backend API will run on `http://localhost:5000`.*

### 4. Frontend Setup
Open a **new** terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Start the Vite dev server:
```bash
npm run dev
```
*The application will launch at `http://localhost:3000` (or `http://localhost:5173`).*

---

## 🐳 Docker Support (Optional)

You can run the entire stack (MongoDB, Backend, Frontend) locally with a single command using Docker Compose:
```bash
docker-compose up --build
```
*Note: Ensure your `backend/.env` file is configured correctly first!*

---

## 🌍 Production Deployment

Nutrivo is fully configured for seamless deployment to modern cloud platforms.

### 1. Backend Deployment (Hugging Face Spaces)
We utilize Hugging Face Spaces (Docker SDK) to host the Express/Node.js backend.
1. Create a new Space on [Hugging Face](https://huggingface.co/spaces) and select **Docker** as the SDK.
2. Push the contents of the `/backend` directory to your Space.
3. Add your environment variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`) as Secrets in the Space Settings.
4. The included `Dockerfile` will automatically build the environment and expose the API on port `5000`. Hugging Face automatically handles the routing to this port.

### 2. Frontend Deployment (Vercel)
We utilize Vercel to host the React/Vite frontend.
1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Framework Preset** to **Vite**.
3. Set the **Root Directory** to `frontend`.
4. Add the `VITE_API_URL` environment variable pointing to your deployed Hugging Face Space URL (e.g., `https://your-space-name.hf.space/api`).
5. Click **Deploy**. Vercel will handle the rest, including SPA routing via the included `vercel.json` file.

---

## 🤖 AI Prompt Engineering

Nutrivo utilizes a highly structured prompt to guide the Gemini Vision AI:
1. Identify all visible ingredients and food items.
2. Estimate absolute weights/portions based on visual context and plate sizing.
3. Enforce a strict JSON output schema for seamless frontend integration.
4. Calculate comprehensive macro and micronutrients (Calories, Protein, Carbs, Fat, Fiber).
5. Provide an AI Confidence Score (0-100) based on image clarity and food visibility.

---

<div align="center">
  <p>Built with ❤️</p>
</div>
