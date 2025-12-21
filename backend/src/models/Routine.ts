import mongoose from 'mongoose';

const exerciseTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: [{
    weight: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    rpe: { type: Number, default: 0 }
  }],
  notes: String
});

const routineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  days: [{
    type: String, // 'Mon', 'Tue', etc.
  }],
  exercises: [exerciseTemplateSchema],
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Routine', routineSchema);
