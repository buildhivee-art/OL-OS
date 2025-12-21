import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  period: { type: String, default: 'monthly' } // currently only supporting monthly
}, { timestamps: true });

// One budget per category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
