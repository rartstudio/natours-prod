const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//enable merge params to get access value in tourId
const router = express.Router({ mergeParams: true });

//whatever route on bottom will be proceeded
//POST /tour/132131/reviews
//GET /tour/132131/reviews
//POST /reviews

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user'), reviewController.updateReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;

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
