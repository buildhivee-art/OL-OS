import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Check if this is the first user
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
     res.status(500).json({ message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
      const user = await User.findById(req.user.id).select('-password');
      res.status(200).json(user);
  } catch(error) {
      res.status(500).json({message: (error as Error).message});
  }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.bio = req.body.bio || user.bio;
        user.tagline = req.body.tagline || user.tagline;
        user.location = req.body.location || user.location;
        user.website = req.body.website || user.website;
        user.goals = req.body.goals || user.goals;
        user.skills = req.body.skills || user.skills;
        
        // Handle nested attributes carefully
        if (req.body.attributes) {
            user.attributes = { ...user.attributes, ...req.body.attributes };
        }

        const updatedUser = await user.save();
        
        res.status(200).json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            level: updatedUser.level,
            xp: updatedUser.xp,
            bio: updatedUser.bio,
            tagline: updatedUser.tagline,
            location: updatedUser.location,
            website: updatedUser.website,
            goals: updatedUser.goals,
            skills: updatedUser.skills,
            attributes: updatedUser.attributes,
            token: generateToken(updatedUser.id),
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
