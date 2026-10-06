const router = require('express').Router();
const WaterLog = require('../models/WaterLog');
const auth = require('../middleware/auth');

// GET today's total + logs
router.get('/', auth, async (req, res) => {
  try {
    const dateKey = req.query.date || new Date().toISOString().split('T')[0];
    const logs = await WaterLog.find({ user: req.user._id, dateKey }).sort({ loggedAt: 1 });
    const totalMl = logs.reduce((sum, l) => sum + l.amountInMl, 0);
    res.json({ logs, totalMl, dateKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add water
router.post('/', auth, async (req, res) => {
  try {
    const { amountInMl } = req.body;
    if (!amountInMl || amountInMl <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    const dateKey = new Date().toISOString().split('T')[0];
    const log = await WaterLog.create({ user: req.user._id, amountInMl, dateKey });

    const allLogs = await WaterLog.find({ user: req.user._id, dateKey });
    const totalMl = allLogs.reduce((sum, l) => sum + l.amountInMl, 0);

    res.status(201).json({ log, totalMl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a water log entry
router.delete('/:id', auth, async (req, res) => {
  try {
    await WaterLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    const dateKey = new Date().toISOString().split('T')[0];
    const allLogs = await WaterLog.find({ user: req.user._id, dateKey });
    const totalMl = allLogs.reduce((sum, l) => sum + l.amountInMl, 0);
    res.json({ totalMl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
