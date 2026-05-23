const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Update goals
router.patch('/goals', auth, async (req, res) => {
  try {
    const { calories, protein, carbs, fat, fiber } = req.body;
    req.user.goals = { ...req.user.goals, calories, protein, carbs, fat, fiber };
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, profile } = req.body;
    if (name) req.user.name = name;
    if (profile) req.user.profile = { ...req.user.profile, ...profile };
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
