const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  foodId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String },
  cuisine: { type: String },
  ingredients: { type: [String], default: [] },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  description: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);