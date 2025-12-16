import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // For initial seed, we might not have a user
  }
}, {
  timestamps: true
});

// Create slug from name
categorySchema.pre('save', async function(this: any) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/ /g, '-');
  }
});

export default mongoose.model('Category', categorySchema);
