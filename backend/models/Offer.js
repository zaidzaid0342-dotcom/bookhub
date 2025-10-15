// models/Offer.js
const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  buyer: {
    type: String,
    ref: 'User',
    required: true,
  },
  message: {  // Replaced offerPrice with message
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Offer', OfferSchema);