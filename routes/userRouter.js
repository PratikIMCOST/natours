const express = require('express');

const userRouter = require('../controllers/userController');
const authController = require('../controllers/authController');
const userController = require('./../controllers/userController');

const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);
Router.post('/forgetPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

Router.use(authController.protect);

Router.patch('/updatePassword', authController.updatePassword);
Router.get('/me', userController.getMe, userController.getUser);
Router.patch('/updateMe', userController.uploadUserphoto, userController.resizeUserPhoto, userController.updateMe);
Router.delete('/deleteMe', userController.deleteMe);

Router.use(authController.restrictTo('admin'));

Router.route('/').get(userRouter.getAllUsers).post(userRouter.createUsers);
Router.route('/:id').get(userRouter.getUser).patch(userRouter.updateUser).delete(userRouter.deleteUser);

module.exports = Router;
