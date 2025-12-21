import { Request, Response } from 'express';
import Routine from '../models/Routine';

// @desc    Get all routines for user
// @route   GET /api/v1/routines
// @access  Private
export const getRoutines = async (req: any, res: Response) => {
  try {
    const routines = await Routine.find({ user: req.user.id });
    res.json(routines);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a routine
// @route   POST /api/v1/routines
// @access  Private
export const createRoutine = async (req: any, res: Response) => {
  try {
    const { name, days, exercises, notes } = req.body;

    const routine = await Routine.create({
      user: req.user.id,
      name,
      days: days || [],
      exercises: exercises || [],
      notes
    });

    res.status(201).json(routine);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update a routine
// @route   PUT /api/v1/routines/:id
// @access  Private
export const updateRoutine = async (req: any, res: Response) => {
  try {
    const routine = await Routine.findOneAndUpdate(
       { _id: req.params.id, user: req.user.id },
       req.body,
       { new: true, runValidators: true }
    );

    if (!routine) {
      res.status(404).json({ message: 'Routine not found' });
      return;
    }

    res.json(routine);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a routine
// @route   DELETE /api/v1/routines/:id
// @access  Private
export const deleteRoutine = async (req: any, res: Response) => {
  try {
    const routine = await Routine.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!routine) {
      res.status(404).json({ message: 'Routine not found' });
      return;
    }

    res.json({ message: 'Routine removed' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
// @desc    Seed default calisthenics routines
// @route   POST /api/v1/routines/seed
// @access  Private
export const seedRoutines = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const presets = [
        {
            name: "Push Mastery (Chest & Shoulders)",
            days: ["Monday"],
            exercises: [
                { name: "Push-ups (Standard)", sets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 12, weight: 0 }] },
                { name: "Pike Push-ups (Shoulder Focus)", sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 8, weight: 0 }] },
                { name: "Diamond Push-ups (Triceps)", sets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
                { name: "Bench Dips (Chair/Couch)", sets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }] },
                { name: "Handstand Wall Hold", sets: [{ reps: 0, weight: 0, completed: false, notes: "Hold for 30-60s" }, { reps: 0, weight: 0, notes: "Hold for 30-60s" }] }
            ],
            notes: "Focus on form and controlled descent. Keep core tight for handstands."
        },
        {
            name: "Pull & L-Sit (Back & Core)",
            days: ["Tuesday"],
            exercises: [
                { name: "Doorframe Row / Table Row", sets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
                { name: "Superman Holds (Lower Back)", sets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }] },
                { name: "L-Sit Tucks (Floor/Parallettes)", sets: [{ reps: 0, weight: 0, notes: "Max hold" }, { reps: 0, weight: 0, notes: "Max hold" }, { reps: 0, weight: 0, notes: "Max hold" }] },
                { name: "Hollow Body Hold", sets: [{ reps: 0, weight: 0, notes: "45s" }, { reps: 0, weight: 0, notes: "45s" }] },
                { name: "Scapular Shrugs (Floor)", sets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }] }
            ],
            notes: "Pulling strength without equipment is tough. Focus on squeezing the back muscles."
        },
        {
            name: "Leg Destruction",
            days: ["Wednesday"],
            exercises: [
                { name: "Bodyweight Squats", sets: [{ reps: 20, weight: 0 }, { reps: 20, weight: 0 }, { reps: 20, weight: 0 }] },
                { name: "Bulgarian Split Squats", sets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
                { name: "Reverse Lunges", sets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }] },
                { name: "Glute Bridges", sets: [{ reps: 20, weight: 0 }, { reps: 20, weight: 0 }] },
                { name: "Calf Raises (Single Leg)", sets: [{ reps: 20, weight: 0 }, { reps: 20, weight: 0 }] }
            ],
            notes: "High volume for legs since weight is low. Time under tension is key."
        },
        {
            name: "Skill Day (Handstand & Abs)",
            days: ["Thursday"],
            exercises: [
                { name: "Handstand Kick-ups", sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
                { name: "Wall Walks", sets: [{ reps: 5, weight: 0 }, { reps: 5, weight: 0 }] },
                { name: "Leg Raises (Lying)", sets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }] },
                { name: "Plank to Push-up", sets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
                { name: "Russian Twists", sets: [{ reps: 30, weight: 0 }, { reps: 30, weight: 0 }] }
            ],
            notes: "Quality over quantity. Rest longer between skill sets."
        },
        {
            name: "Full Body Metcon (Endurance)",
            days: ["Friday"],
            exercises: [
                { name: "Burpees", sets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }] },
                { name: "Mountain Climbers", sets: [{ reps: 40, weight: 0 }, { reps: 40, weight: 0 }] },
                { name: "Jump Squats", sets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }] },
                { name: "Push-ups", sets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }] }
            ],
            notes: "Minimal rest. Keep the heart rate up. 'Conditioning' day."
        }
    ];

    await Routine.insertMany(presets.map(p => ({ ...p, user: userId })));

    res.status(201).json({ message: 'Calisthenics routines seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
