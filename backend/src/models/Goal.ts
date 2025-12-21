import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date },
  color: { type: String, default: '#f59e0b' },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);
