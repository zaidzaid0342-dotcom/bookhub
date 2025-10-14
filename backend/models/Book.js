const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  bookName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  seller: {
    type: String,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available',
  },
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);