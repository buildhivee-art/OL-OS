"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFood = exports.deleteFood = exports.createFood = exports.getFoods = void 0;
const Food_1 = __importDefault(require("../models/Food"));
const getFoods = async (req, res) => {
    try {
        const foods = await Food_1.default.find({ user: req.user._id }).sort({ name: 1 });
        res.json(foods);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching foods', error });
    }
};
exports.getFoods = getFoods;
const createFood = async (req, res) => {
    try {
        const { name, calories, macros, micros, servingSize, category } = req.body;
        const food = await Food_1.default.create({
            user: req.user._id,
            name,
            calories,
            macros,
            micros,
            servingSize,
            category
        });
        res.status(201).json(food);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating food', error });
    }
};
exports.createFood = createFood;
const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food_1.default.findOneAndDelete({ _id: id, user: req.user._id });
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        res.json({ message: 'Food deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting food', error });
    }
};
exports.deleteFood = deleteFood;
const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food_1.default.findOneAndUpdate({ _id: id, user: req.user._id }, req.body, { new: true });
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        res.json(food);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating food', error });
    }
};
exports.updateFood = updateFood;
