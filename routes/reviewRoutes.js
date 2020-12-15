const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//enable merge params to get access value in tourId
const router = express.Router({mergeParams: true});

//whatever route on bottom will be proceeded
//POST /tour/132131/reviews
//GET /tour/132131/reviews
//POST /reviews
// router
//     .route('/')
//     .get(reviewController.getAllReviews)
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview
//     );

// router
// 	.route('/:id')
//     .delete(reviewController.deleteReview);
    
router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.protect,
		authController.restrictTo('user'),
		reviewController.setTourUserIds,
		reviewController.createReview
	);

router
	.route('/:id')
	.get(reviewController.getReview)
	.patch(reviewController.updateReview)
	.delete(reviewController.deleteReview);

module.exports = router;