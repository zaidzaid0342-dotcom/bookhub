const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth'); // Add this import
const bookController = require('../controllers/bookController');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post('/', auth, upload.single('image'), bookController.addBook);
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);
router.post('/offer/:id', auth, bookController.makeOffer);
router.get('/offers/:id', auth, bookController.getBookOffers);
router.put('/offer/:id', auth, bookController.respondToOffer);

module.exports = router;