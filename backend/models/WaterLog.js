const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amountInMl: { type: Number, required: true },
  dateKey:    { type: String, required: true }, // YYYY-MM-DD
  loggedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

waterLogSchema.index({ user: 1, dateKey: 1 });

module.exports = mongoose.model('WaterLog', waterLogSchema);
