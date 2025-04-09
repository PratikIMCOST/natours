const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRouter');

const Router = express.Router();

Router.use('/:tourId/reviews', reviewRouter);

// POST /tour/23141234/review
// GET /tour/23141234/review
// GET /tour/23141234/review/23141234

// Router.route('/:tourId/reviews').post(
//   authController.protect,
//   authController.restrictTo('user'),
//   reviewController.createReview,
// );

// Router.param('id', tourController.checkID);
Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
Router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guid', 'guide'),
  tourController.getMonthlyPlan,
);

Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
Router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

Router.route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guid'), tourController.createTour);
Router.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guid'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guid'), tourController.deleteTour);

module.exports = Router;
