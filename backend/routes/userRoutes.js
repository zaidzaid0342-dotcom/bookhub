const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);
router.get('/mybooks', auth, userController.getUserBooks);
router.get('/offers', auth, userController.getUserOffers); // Add this route

module.exports = router;