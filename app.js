const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cors = require('cors');
// const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppErrors = require('./utils/appErrors');
const globalErrorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const viewRouter = require('./routes/viewRouter');

const app = express();

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

// 1) GLOBLE Middleware

app.use(cors());
app.options('*', cors());

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security headers
// app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Setting rate limiter on perticular IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try after an hour',
});
app.use('/api', limiter);

// Body Parser including json response on application
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injections
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['ratingsAverage', 'ratingsQualtity', 'duration', 'maxGroupSize', 'difficulty', 'price'],
  }),
);

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// ==============   Tours Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'Fail';
  next(new AppErrors(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorController);

module.exports = app;
