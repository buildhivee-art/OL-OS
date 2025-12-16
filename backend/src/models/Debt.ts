import mongoose from 'mongoose';

const debtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['payable', 'receivable'], // payable = I owe, receivable = They owe me
    required: true
  },
  person: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date
  },
  isSettled: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Debt', debtSchema);
