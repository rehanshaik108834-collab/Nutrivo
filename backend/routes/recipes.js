const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/suggest', auth, async (req, res) => {
  try {
    const { remainingMacros } = req.body;
    const { calories, protein, carbs, fat } = remainingMacros || {};

    if (!calories || calories <= 0) {
      return res.status(400).json({ message: 'No remaining calories to fill. Great job hitting your goal!' });
    }

    const prompt = `You are a professional nutritionist and personal chef. Generate a single realistic, easy-to-cook recipe that fills the following remaining daily macro targets:

- Calories: ~${Math.round(calories)} kcal
- Protein: ~${Math.round(protein || 0)}g
- Carbs: ~${Math.round(carbs || 0)}g
- Fat: ~${Math.round(fat || 0)}g

Return ONLY a valid JSON object with this exact structure (no markdown, no backticks, no explanation):
{
  "name": "Recipe name",
  "prepTime": "15 minutes",
  "servings": 1,
  "description": "A short, enticing one-sentence description",
  "ingredients": [
    { "item": "ingredient name", "amount": "quantity with unit" }
  ],
  "instructions": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "nutrition": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  },
  "tip": "A quick cooking tip to make this recipe even better"
}

Rules:
- Keep it realistic and easy to cook (under 30 minutes)
- The recipe nutrition should closely match the target macros
- Use common, accessible ingredients
- Return ONLY the JSON object`;

    const modelsToTry = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.5-flash'];
    let recipe = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const clean = text.replace(/```json|```/g, '').trim();
        recipe = JSON.parse(clean);
        break;
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err.message);
      }
    }

    if (!recipe) {
      return res.status(500).json({ message: 'Failed to generate recipe. Please try again.' });
    }

    res.json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
