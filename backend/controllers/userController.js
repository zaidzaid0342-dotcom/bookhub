const User = require('../models/User');
const Book = require('../models/Book');
const Offer = require('../models/Offer');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // req.user.id is the MongoDB _id (ObjectId)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const { schoolName, collegeName, className, username, id, city, state, email, phone } = req.body;

  try {
    // req.user.id is the MongoDB _id (ObjectId)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.schoolName = schoolName || user.schoolName;
    user.collegeName = collegeName || user.collegeName;
    user.className = className || user.className;
    user.username = username || user.username;
    user.id = id || user.id; // Update custom ID if provided
    user.city = city || user.city;
    user.state = state || user.state;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user's books
exports.getUserBooks = async (req, res) => {
  try {
    // req.user.id is the MongoDB _id (ObjectId)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find books where seller matches the user's custom ID
    const books = await Book.find({ seller: user.id });
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all offers made by the current user
exports.getUserOffers = async (req, res) => {
  try {
    // Get the user to get the custom ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('User custom ID:', user.id);

    // Find all offers made by the current user using the custom ID
    const offers = await Offer.find({ buyer: user.id });
    console.log('Found offers:', offers);
    
    // For each offer, populate both book and buyer details
    const offersWithDetails = await Promise.all(offers.map(async (offer) => {
      const book = await Book.findById(offer.book);
      const buyer = await User.findOne({ id: offer.buyer }).select('-password');
      const seller = book ? await User.findOne({ id: book.seller }).select('-password') : null;
      
      return {
        ...offer.toObject(),
        book: book ? { ...book.toObject(), seller } : null,
        buyer
      };
    }));
    
    res.json(offersWithDetails);
  } catch (err) {
    console.error('Error getting user offers:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};