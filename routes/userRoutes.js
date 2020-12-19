const express = require('express');
const userController = require('./../controllers/userController');

const router = express.Router();

//add after userController
const authController = require('./../controllers/authController');

//add before router.route('/')
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//to protect middleware after it
router.use(authController.protect);

router.patch('/updateMyPassword',authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe',userController.deleteMe);

router.get('/logout', authController.logout);

//protect middleware after it with restrict to admin
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
