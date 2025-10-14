const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const admin = require('../middleware/admin'); 
const adminController = require('../controllers/adminController');

// Admin routes
router.get('/users', auth, admin, adminController.getAllUsers);
router.get('/users/:id', auth, admin, adminController.getUserById);
router.put('/users/:id', auth, admin, adminController.updateUser);
router.delete('/users/:id', auth, admin, adminController.deleteUser);
router.get('/books', auth, admin, adminController.getAllBooks);
router.delete('/books/:id', auth, admin, adminController.deleteBook);

module.exports = router;