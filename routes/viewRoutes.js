const express = require('express');

const router = express.Router();
const viewsController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

// router.use(authController.isLoggedIn);
//using extending layout
//our layout is base.pug
//another file except base.pug is pages 
//underscore file is include part
router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview );
router.get('/tours/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login',authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);


module.exports = router;