const router = require('express').Router();
const Meal = require('../models/Meal');
const auth = require('../middleware/auth');

// Helper: aggregate nutrition for a set of meals
function aggregateNutrition(meals) {
  return meals.reduce((acc, meal) => {
    const n = meal.nutrition || {};
    acc.calories += n.calories || 0;
    acc.protein += n.protein || 0;
    acc.carbs += n.carbs || 0;
    acc.fat += n.fat || 0;
    acc.fiber += n.fiber || 0;
    acc.sugar += n.sugar || 0;
    acc.sodium += n.sodium || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });
}

// Weekly analytics (last 7 days)
router.get('/weekly', auth, async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push(d.toISOString().split('T')[0]);
    }

    const meals = await Meal.find({
      user: req.user._id,
      dateKey: { $in: days }
    });

    const dailyData = days.map(day => {
      const dayMeals = meals.filter(m => m.dateKey === day);
      return {
        date: day,
        label: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        mealCount: dayMeals.length,
        nutrition: aggregateNutrition(dayMeals)
      };
    });

    const totals = aggregateNutrition(meals);
    const activeDays = dailyData.filter(d => d.mealCount > 0).length;

    res.json({
      days: dailyData,
      totals,
      averages: activeDays > 0 ? {
        calories: Math.round(totals.calories / activeDays),
        protein: Math.round(totals.protein / activeDays),
        carbs: Math.round(totals.carbs / activeDays),
        fat: Math.round(totals.fat / activeDays)
      } : { calories: 0, protein: 0, carbs: 0, fat: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Monthly analytics
router.get('/monthly', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;

    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const endDate = new Date(y, m, 0).toISOString().split('T')[0];

    const meals = await Meal.find({
      user: req.user._id,
      dateKey: { $gte: startDate, $lte: endDate }
    });

    // Group by day
    const byDay = {};
    meals.forEach(meal => {
      if (!byDay[meal.dateKey]) byDay[meal.dateKey] = [];
      byDay[meal.dateKey].push(meal);
    });

    const days = Object.keys(byDay).sort().map(date => ({
      date,
      label: new Date(date).getDate().toString(),
      mealCount: byDay[date].length,
      nutrition: aggregateNutrition(byDay[date])
    }));

    // Weekly breakdown within month
    const weeks = [[], [], [], [], []];
    days.forEach(d => {
      const dayOfMonth = new Date(d.date).getDate();
      const weekIdx = Math.floor((dayOfMonth - 1) / 7);
      weeks[Math.min(weekIdx, 4)].push(d);
    });

    const weeklyBreakdown = weeks
      .filter(w => w.length > 0)
      .map((w, i) => ({
        week: `Week ${i + 1}`,
        nutrition: aggregateNutrition(w.flatMap(d => d.nutrition ? [{ nutrition: d.nutrition }] : []))
      }));

    const totals = aggregateNutrition(meals);
    const activeDays = days.length;

    res.json({
      month: m, year: y,
      days,
      weeklyBreakdown,
      totals,
      activeDays,
      averages: activeDays > 0 ? {
        calories: Math.round(totals.calories / activeDays),
        protein: Math.round(totals.protein / activeDays),
        carbs: Math.round(totals.carbs / activeDays),
        fat: Math.round(totals.fat / activeDays)
      } : { calories: 0, protein: 0, carbs: 0, fat: 0 },
      mealTypeBreakdown: getMealTypeBreakdown(meals)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function getMealTypeBreakdown(meals) {
  const types = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
  meals.forEach(m => { types[m.mealType] = (types[m.mealType] || 0) + 1; });
  return types;
}

// Daily summary
router.get('/daily/:date', auth, async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user._id, dateKey: req.params.date });
    const nutrition = aggregateNutrition(meals);
    const byType = {};
    meals.forEach(m => {
      if (!byType[m.mealType]) byType[m.mealType] = [];
      byType[m.mealType].push(m);
    });

    res.json({
      date: req.params.date,
      meals,
      nutrition,
      mealCount: meals.length,
      byType
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Streak info
router.get('/streak', auth, async (req, res) => {
  try {
    res.json({ streak: req.user.streak, lastLogDate: req.user.lastLogDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
