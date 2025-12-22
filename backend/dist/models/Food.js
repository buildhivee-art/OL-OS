"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const foodSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
exports.default = mongoose_1.default.model('Food', foodSchema);
