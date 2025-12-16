import { Request, Response } from 'express';
import Category from '../models/Category';

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a category
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = async (req: any, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Please provide a category name' });
      return;
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }

    const category = await Category.create({
      name,
      createdBy: req.user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update a category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    category.name = req.body.name || category.name;
    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    await category.deleteOne();
    res.status(200).json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Seed initial categories
// @access  Internal
export const seedCategories = async () => {
  const initialCategories = [
    'reading', 'docs', 'startup', 'leetcode', 'DSA', 'code', 
    'project', 'twitter', 'social', 'health', 'calesthenics', 
    'workout', 'content', 'grow', 'japanese', 'CS core'
  ];

  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      const categoriesToInsert = initialCategories.map(name => ({ name }));
      await Category.insertMany(categoriesToInsert);
      console.log('Initial categories seeded');
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};
