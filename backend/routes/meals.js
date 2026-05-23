const router = require('express').Router();
const Groq = require('groq-sdk');
const Meal = require('../models/Meal');
const auth = require('../middleware/auth');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// AI analyze meal from image using Groq vision (Llama 4 Scout)
async function analyzeMealImage(base64Image, mimeType = 'image/jpeg') {
  const prompt = `You are a professional nutritionist and food analyst. Analyze this meal image and provide detailed nutritional information.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation, no backticks):
{
  "name": "meal name",
  "description": "brief description of what you see",
  "mealType": "breakfast|lunch|dinner|snack",
  "confidence": 85,
  "aiNotes": "any important notes about estimation accuracy",
  "foods": [
    {
      "name": "food item name",
      "portion": "estimated portion size",
      "nutrition": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "fiber": 0,
        "sugar": 0,
        "sodium": 0,
        "cholesterol": 0
      }
    }
  ],
  "totalNutrition": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 0,
    "cholesterol": 0
  }
}

Rules:
- Identify ALL food items visible in the image
- Estimate portions based on visual cues (plate size, standard servings)
- All nutrition values in grams except calories (kcal) and sodium (mg), cholesterol (mg)
- confidence is 0-100 based on how clearly you can identify the food
- Be as accurate as possible with nutritional estimates
- If image is unclear, still provide best estimates with lower confidence score
- Return ONLY the JSON object, nothing else`;

  const response = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 2000,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64Image}` }
        },
        { type: 'text', text: prompt }
      ]
    }]
  });

  const text = response.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// Log a meal
router.post('/', auth, async (req, res) => {
  try {
    const { imageData, imageMimeType, mealType, loggedAt } = req.body;
    if (!imageData) return res.status(400).json({ message: 'Image data required' });

    // Strip data URL prefix if present
    const base64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const mime = imageMimeType || 'image/jpeg';

    // AI analysis
    let analysis;
    try {
      analysis = await analyzeMealImage(base64, mime);
    } catch (aiErr) {
      console.error('AI analysis error:', aiErr);
      return res.status(500).json({ message: 'Failed to analyze meal image. Please try again.' });
    }

    const meal = new Meal({
      user: req.user._id,
      imageData: base64,
      imageMimeType: mime,
      mealType: mealType || analysis.mealType || 'snack',
      name: analysis.name,
      description: analysis.description,
      foods: analysis.foods,
      nutrition: analysis.totalNutrition,
      aiConfidence: analysis.confidence,
      aiNotes: analysis.aiNotes,
      loggedAt: loggedAt ? new Date(loggedAt) : new Date()
    });

    await meal.save();

    // Update user streak
    const user = req.user;
    const today = new Date().toISOString().split('T')[0];
    const lastLog = user.lastLogDate ? user.lastLogDate.toISOString().split('T')[0] : null;
    if (lastLog !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      user.streak = lastLog === yesterday ? user.streak + 1 : 1;
      user.lastLogDate = new Date();
      await user.save();
    }

    res.status(201).json({ meal, analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get meals for a specific date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const meals = await Meal.find({
      user: req.user._id,
      dateKey: req.params.date
    }).sort({ loggedAt: 1 });
    res.json({ meals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get today's meals
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const meals = await Meal.find({
      user: req.user._id,
      dateKey: today
    }).sort({ loggedAt: 1 });
    res.json({ meals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a meal
router.delete('/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;