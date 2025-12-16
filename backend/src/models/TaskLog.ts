import mongoose from 'mongoose';

const taskLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  month: {
    type: String, // YYYY-MM
    required: true,
  },
  completedDays: [{
    type: Number, // 1-31
  }]
}, {
  timestamps: true
});

// Unique log per task per month
taskLogSchema.index({ task: 1, month: 1 }, { unique: true });

export default mongoose.model('TaskLog', taskLogSchema);
