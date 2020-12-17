const express = require('express');

const router = express.Router();
const viewsController = require('../controllers/viewController');

//using extending layout
//our layout is base.pug
//another file except base.pug is pages 
//underscore file is include part
router.get('/', viewsController.getOverview);
router.get('/tours/:slug', viewsController.getTour);


module.exports = router;