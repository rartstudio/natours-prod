const express = require('express');

const router = express.Router();
const viewsController = require('../controllers/viewController');
const authController = require('../controllers/authController');

// router.use(authController.isLoggedIn);
//using extending layout
//our layout is base.pug
//another file except base.pug is pages 
//underscore file is include part
router.get('/', authController.isLoggedIn, viewsController.getOverview );
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login',authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);


module.exports = router;