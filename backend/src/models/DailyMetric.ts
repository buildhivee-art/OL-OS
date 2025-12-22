import mongoose from 'mongoose';

const dailyMetricSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  weight: {
    type: Number,
    default: 0,
  },
  hp: {
    type: Number,
    default: 0,
  },
  calories: {
      type: Number, // kcal
      default: 0
  },
  water: {
      type: Number, // ml
      default: 0
  },
  macros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 }
  },
  body: {
      neck: { type: Number, default: 0 },
      shoulders: { type: Number, default: 0 },
      chest: { type: Number, default: 0 },
      waist: { type: Number, default: 0 },
      hips: { type: Number, default: 0 },
      biceps: { type: Number, default: 0 },
      forearms: { type: Number, default: 0 },
      thighs: { type: Number, default: 0 },
      calves: { type: Number, default: 0 },
  },
  micros: {
      magnesium: { type: Number, default: 0 }, // mg
      calcium: { type: Number, default: 0 }, // mg
      vitaminD: { type: Number, default: 0 }, // IU
      zinc: { type: Number, default: 0 }, // mg
      iron: { type: Number, default: 0 }, // mg
      potassium: { type: Number, default: 0 }, // mg
      vitaminC: { type: Number, default: 0 }, // mg
  },
  foodLog: [{
      id: String,
      name: String,
      calories: Number,
      macros: { protein: Number, carbs: Number, fats: Number },
      timestamp: { type: Date, default: Date.now }
  }],
  supplements: [{
      id: String,
      name: String,
      taken: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Unique metric per day
dailyMetricSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyMetric', dailyMetricSchema);
