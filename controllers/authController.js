const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppErrors = require('./../utils/appErrors');
const Email = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TIMEOUT });
};

const createAndSendToken = (user, code, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_TIMEOUT * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(code).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendMail();

  createAndSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password are valid
  if (!email || !password) {
    return next(new AppErrors('Please Provide Email and Password', 400));
  }

  // 2) check if user exist && password is correct
  const user = await User.findOne({ email }).select('+password');
  //   const correct = ;

  //   if (!user || !correct) return next(new AppErrors('Invalid Email or Password', 401));
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErrors('Invalid User or Password', 401));
  }

  createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppErrors('You are not logged in. Please login to get access', 401));
  }

  // 2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppErrors('The user belonging to this token does no longer exists.', 401));
  }

  // 4) Check is user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppErrors('User recently changed password. Please login again.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 2) Verification of token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 4) Check is user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // GRANT ACCESS TO PROTECTED ROUTES
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Role [admin, lead-guid], if role=user return error
    if (!roles.includes(req.user.role)) {
      return next(new AppErrors('You are not allowed to make this action', 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppErrors('There is no user with this email Address', 404));
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  // 3) Send it to user's email
  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'Success',
      message: 'Email send Successfully',
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordChangedAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppErrors('There was an error sending this mail. Try again later!', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get User based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

  //   2) If the token has not expired and there is a user, set the new password
  if (!user) {
    return next(new AppErrors('Token is Invalid or Expired!', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //   3) Update changedPasswordAt property for the user
  //   4) Log the user in, send JWT
  createAndSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  // 2) check if POSTed current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppErrors('Invalid ID! or wrong password Try again..', 401));
  }

  // 3) if so update the password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  // 4) Log user in, Send the JWT res
  createAndSendToken(user, 200, res);
});
