const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
  cholesterol: { type: Number, default: 0 }
}, { _id: false });

const mealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageData: { type: String, required: true }, // base64 or URL
  imageMimeType: { type: String, default: 'image/jpeg' },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'snack'
  },
  name: { type: String, default: 'Meal' },
  description: { type: String, default: '' },
  foods: [{
    name: String,
    portion: String,
    nutrition: nutritionSchema
  }],
  nutrition: nutritionSchema,
  aiConfidence: { type: Number, default: 0, min: 0, max: 100 },
  aiNotes: { type: String, default: '' },
  loggedAt: { type: Date, default: Date.now },
  dateKey: { type: String } // YYYY-MM-DD for easy daily queries
}, { timestamps: true });

mealSchema.pre('save', function(next) {
  const d = this.loggedAt || new Date();
  this.dateKey = d.toISOString().split('T')[0];
  next();
});

mealSchema.index({ user: 1, dateKey: 1 });
mealSchema.index({ user: 1, loggedAt: -1 });

module.exports = mongoose.model('Meal', mealSchema);
