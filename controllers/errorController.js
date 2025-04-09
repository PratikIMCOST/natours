const AppErrors = require('./../utils/appErrors');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppErrors(message, 400);
};

const handleDublicateFieldDB = (err) => {
  const value = err.keyValue.name;
  const message = `Dublicate value: ${value}, Try again!`;
  return new AppErrors(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errorMsg = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data: ${errorMsg.join('. ')}`;
  return new AppErrors(message, 400);
};

const handleJWTError = () => new AppErrors('Invalid Token. Please login again!', 401);

const handleJWTExpiredError = () => new AppErrors('Your Token is expired. Please login again!', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, Trusted error: send msg to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Log error
    console.error('ERROR 💥 ', err);

    // send generic message
    return res.status(err.statusCode).json({
      status: 'error',
      message: 'Somthing went very wrong!',
    });
  }

  // B) RENDERED Website
  // Operational, Trusted error: send msg to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  }
  // Log error
  console.error('ERROR 💥 ', err);

  // send generic message
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: 'Something went wrong, try again letter.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDublicateFieldDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
