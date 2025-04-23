const express = require('express');
const viewController = require('./../controllers/viewController');
// const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.use();
// bookingController.createBookingCheckout
router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.login);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.post('/submit-form-data', authController.protect, viewController.updateCurrentUser);

module.exports = router;
