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
  }
}, {
  timestamps: true
});

// Unique metric per day
dailyMetricSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyMetric', dailyMetricSchema);
