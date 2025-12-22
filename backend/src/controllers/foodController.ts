import { Request, Response } from 'express';
import Food from '../models/Food';

export const getFoods = async (req: Request, res: Response) => {
  try {
    const foods = await Food.find({ user: (req as any).user._id }).sort({ name: 1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching foods', error });
  }
};

export const createFood = async (req: Request, res: Response) => {
  try {
    const { name, calories, macros, micros, servingSize, category } = req.body;
    
    const food = await Food.create({
      user: (req as any).user._id,
      name,
      calories,
      macros,
      micros,
      servingSize,
      category
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error creating food', error });
  }
};

export const deleteFood = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const food = await Food.findOneAndDelete({ _id: id, user: (req as any).user._id });
        
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        
        res.json({ message: 'Food deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting food', error });
    }
};

export const updateFood = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const food = await Food.findOneAndUpdate(
            { _id: id, user: (req as any).user._id },
            req.body,
            { new: true }
        );

        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json(food);
    } catch (error) {
        res.status(500).json({ message: 'Error updating food', error });
    }
}
