const Book = require('../models/Book');
const Offer = require('../models/Offer');
const User = require('../models/User');

// Add a new book
exports.addBook = async (req, res) => {
  const { bookName, category, collegeName, pickupAddress, price } = req.body;
  const image = req.file.path;

  try {
    // req.user.id is the MongoDB _id (ObjectId)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newBook = new Book({
      bookName,
      category,
      collegeName,
      pickupAddress,
      price,
      image,
      seller: user.id, // Use the custom string ID
    });

    const book = await newBook.save();
    res.json(book);
  } catch (err) {
    console.error('Error adding book:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: 'available' });
    
    // Manually populate seller details for each book
    const booksWithSeller = await Promise.all(books.map(async (book) => {
      const seller = await User.findOne({ id: book.seller }).select('-password');
      return { ...book.toObject(), seller };
    }));
    
    res.json(booksWithSeller);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    // req.params.id is the MongoDB _id (ObjectId) for the book
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Manually populate seller details
    const seller = await User.findOne({ id: book.seller }).select('-password');
    
    res.json({ ...book.toObject(), seller });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Search books - This was missing
exports.searchBooks = async (req, res) => {
  const { category, minPrice, maxPrice } = req.query;

  try {
    let query = { status: 'available' };

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice !== undefined) {
      query.price = { $gte: minPrice };
    } else if (maxPrice !== undefined) {
      query.price = { $lte: maxPrice };
    }

    const books = await Book.find(query);
    
    // Manually populate seller details for each book
    const booksWithSeller = await Promise.all(books.map(async (book) => {
      const seller = await User.findOne({ id: book.seller }).select('-password');
      return { ...book.toObject(), seller };
    }));
    
    res.json(booksWithSeller);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Make an offer
// controllers/bookController.js

// Make an offer (now sending a message)
exports.makeOffer = async (req, res) => {
  console.log('Send message request received');
  console.log('Book ID:', req.params.id);
  console.log('Request body:', req.body);
  console.log('User from token:', req.user);

  let { message } = req.body;  // Changed from offerPrice to message
  const bookId = req.params.id;

  try {
    // Validate message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.log('Invalid message:', message);
      return res.status(400).json({ msg: 'Message is required' });
    }

    const book = await Book.findById(bookId);
    console.log('Found book:', book);
    
    if (!book) {
      console.log('Book not found');
      return res.status(404).json({ msg: 'Book not found' });
    }

    const user = await User.findById(req.user.id);
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('Book seller ID:', book.seller);
    console.log('User ID:', user.id);

    if (book.seller === user.id) {
      console.log('User is the seller');
      return res.status(400).json({ msg: 'Cannot send a message for your own book' });
    }

    const newOffer = new Offer({
      book: bookId,
      buyer: user.id,
      message: message.trim(),  // Changed from offerPrice to message
    });

    const offer = await newOffer.save();
    console.log('Message saved:', offer);
    res.json(offer);
  } catch (err) {
    console.error('Error in makeOffer:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
// Get offers for a book
exports.getBookOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ book: req.params.id });
    
    // Manually populate buyer details for each offer
    const offersWithBuyer = await Promise.all(offers.map(async (offer) => {
      const buyer = await User.findOne({ id: offer.buyer }).select('-password');
      return { ...offer.toObject(), buyer };
    }));
    
    res.json(offersWithBuyer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Respond to an offer
exports.respondToOffer = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'

  try {
    console.log(`Responding to offer ${req.params.id} with status: ${status}`);
    
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }

    const book = await Book.findById(offer.book);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // req.user.id is the MongoDB _id (ObjectId)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (book.seller !== user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    offer.status = status;
    await offer.save();

    // If accepted, mark the book as sold
    if (status === 'accepted') {
      book.status = 'sold';
      await book.save();
      console.log(`Book ${book._id} marked as sold`);
    }

    res.json(offer);
  } catch (err) {
    console.error('Error in respondToOffer:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all books (with optional status filter)
exports.getAllBooks = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    // Only filter by status if it's explicitly provided
    if (status) {
      query.status = status;
    }

    const books = await Book.find(query);
    
    // Manually populate seller details for each book
    const booksWithSeller = await Promise.all(books.map(async (book) => {
      const seller = await User.findOne({ id: book.seller }).select('-password');
      return { ...book.toObject(), seller };
    }));
    
    res.json(booksWithSeller);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};