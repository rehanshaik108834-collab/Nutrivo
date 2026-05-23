# Nutrivo Backend

## Environment Variables

Set the following environment variables (as HuggingFace Spaces Secrets):

- `MONGODB_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — a strong random secret for JWT signing
- `GROQ_API_KEY` — your Groq API key for AI meal analysis
- `CLIENT_URL` — your Vercel frontend URL (e.g. https://nutrivo.vercel.app)
- `PORT` — defaults to 7860 (HuggingFace standard)
