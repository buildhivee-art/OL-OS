import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  servingSize: {
    amount: Number,
    unit: { type: String, default: 'g' } // g, ml, oz, piece
  },
  calories: {
    type: Number,
    required: true,
  },
  macros: {
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fats: { type: Number, required: true }
  },
  micros: {
      magnesium: { type: Number, default: 0 },
      calcium: { type: Number, default: 0 },
      vitaminD: { type: Number, default: 0 },
      zinc: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      potassium: { type: Number, default: 0 },
      vitaminC: { type: Number, default: 0 },
  },
  category: String, // e.g., "Meat", "Veg", "Dairy"
  tags: [String]
}, {
  timestamps: true
});

// Unique food name per user to prevent duplicates? Maybe not strict but good for searching.
foodSchema.index({ user: 1, name: 1 });

export default mongoose.model('Food', foodSchema);
