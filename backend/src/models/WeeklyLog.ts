import mongoose from 'mongoose';

const weeklyLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: String, // YYYY-MM-DD (Monday of the week)
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  mainFocus: {
    type: String,
    default: ''
  },
  wins: {
    type: [String],
    default: []
  },
  lessons: {
    type: [String],
    default: []
  },
  rating: {
    type: Number, // 1-10 or 1-5
    default: 0
  },
  energyLevel: {
      type: Number,
      default: 5
  },
  goalsForNextWeek: {
    type: String,
    default: ''
  },
  mood: {
    type: String,
    default: ''
  }
}, { timestamps: true });

weeklyLogSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

export const WeeklyLog = mongoose.model('WeeklyLog', weeklyLogSchema);
