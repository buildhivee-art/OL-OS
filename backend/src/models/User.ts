import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  bio: {
    type: String,
    default: ''
  },
  tagline: {
    type: String,
    default: 'Player 1'
  },
  location: {
    type: String,
    default: 'Earth'
  },
  website: {
      type: String,
      default: ''
  },
  goals: {
      type: [String],
      default: []
  },
  skills: {
      type: [String],
      default: []
  },
  attributes: {
      intelligence: { type: Number, default: 10 },
      discipline: { type: Number, default: 10 },
      creativity: { type: Number, default: 10 },
      vitality: { type: Number, default: 10 }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(this: any) {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);
