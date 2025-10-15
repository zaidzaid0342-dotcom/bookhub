const User = require('../models/User');
const Book = require('../models/Book');
const Offer = require('../models/Offer'); 

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    // Try to find by custom ID first, then by ObjectId
    let user;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid ObjectId
      user = await User.findById(req.params.id).select('-password');
    } else {
      // It's a custom ID
      user = await User.findOne({ id: req.params.id }).select('-password');
    }
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { schoolName, collegeName, className, username, id, city, state, email, phone, isAdmin } = req.body;

  try {
    // Try to find by custom ID first, then by ObjectId
    let user;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid ObjectId
      user = await User.findById(req.params.id);
    } else {
      // It's a custom ID
      user = await User.findOne({ id: req.params.id });
    }
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user fields
    user.schoolName = schoolName || user.schoolName;
    user.collegeName = collegeName || user.collegeName;
    user.className = className || user.className;
    user.username = username || user.username;
    user.id = id || user.id; // Update custom ID if provided
    user.city = city || user.city;
    user.state = state || user.state;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    // Update isAdmin if provided
    if (typeof isAdmin === 'boolean') {
      user.isAdmin = isAdmin;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    // Try to find by custom ID first, then by ObjectId
    let user;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid ObjectId
      user = await User.findById(req.params.id);
    } else {
      // It's a custom ID
      user = await User.findOne({ id: req.params.id });
    }
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Use deleteOne instead of deprecated remove()
    await User.deleteOne({ _id: user._id });
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    
    // Manually populate seller details for each book
    const booksWithSeller = await Promise.all(books.map(async (book) => {
      try {
        if (!book.seller) {
          return { ...book.toObject(), seller: null };
        }
        
        const seller = await User.findById(book.seller).select('-password');
        return { ...book.toObject(), seller };
      } catch (err) {
        console.error(`Error populating seller for book ${book._id}:`, err);
        return { ...book.toObject(), seller: null };
      }
    }));
    
    res.json(booksWithSeller);
  } catch (err) {
    console.error('Error in getAllBooks:', err);
    res.status(500).json({ msg: 'Server error while fetching books' });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Use deleteOne instead of deprecated remove()
    await Book.deleteOne({ _id: book._id });
    res.json({ msg: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// controllers/adminController.js

// Add this function to your existing adminController.js file


// Get all offers (admin only)
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('book', 'bookName category price status');
    
    // Manually populate buyer details for each offer
    const offersWithBuyer = await Promise.all(offers.map(async (offer) => {
      try {
        // Find buyer by custom ID (stored in the `id` field of User model)
        const buyer = await User.findOne({ id: offer.buyer }).select('-password');
        return { ...offer.toObject(), buyer };
      } catch (err) {
        console.error(`Error fetching buyer for offer ${offer._id}:`, err);
        return { ...offer.toObject(), buyer: null };
      }
    }));
    
    res.json(offersWithBuyer);
  } catch (err) {
    console.error('Error fetching all offers:', err);
    res.status(500).json({ msg: 'Server error while fetching offers' });
  }
};

// Update offer status (admin only)
exports.updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }
    
    offer.status = status;
    await offer.save();
    
    res.json({ msg: 'Offer status updated successfully', offer });
  } catch (err) {
    console.error('Error updating offer status:', err);
    res.status(500).json({ msg: 'Server error while updating offer status' });
  }
};

// Get offer details (admin only)
exports.getOfferDetails = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('book', 'bookName category price status pickupAddress seller');
    
    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }
    
    // Manually fetch buyer by custom ID
    try {
      const buyer = await User.findOne({ id: offer.buyer }).select('-password');
      const offerWithBuyer = { ...offer.toObject(), buyer };
      res.json(offerWithBuyer);
    } catch (err) {
      console.error(`Error fetching buyer for offer ${offer._id}:`, err);
      res.json({ ...offer.toObject(), buyer: null });
    }
  } catch (err) {
    console.error('Error fetching offer details:', err);
    res.status(500).json({ msg: 'Server error while fetching offer details' });
  }
};