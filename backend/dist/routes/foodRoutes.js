"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const foodController_1 = require("../controllers/foodController");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.get('/', foodController_1.getFoods);
router.post('/', foodController_1.createFood);
router.put('/:id', foodController_1.updateFood);
router.delete('/:id', foodController_1.deleteFood);
exports.default = router;
