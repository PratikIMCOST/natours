const User = require(`${__dirname}/../models/userModel`);
const multer = require('multer');
const sharp = require('sharp');
// const { validate, update } = require('../models/userModel');
const AppErrors = require('../utils/appErrors');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./factoryController');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppErrors('Not an Image, Please upload only images!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserphoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (Obj, ...options) => {
  const newObj = {};
  Object.keys(Obj).forEach((el) => {
    if (options.includes(el)) newObj[el] = Obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Reture if try to update password || passwordConfirm
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppErrors('This route is not for password update. try /updatePassword to update password'), 400);
  }

  // 2) filter out fields which should not be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update the user
  const updated = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

  // 4) Send Response
  res.status(200).json({
    status: 'Success',
    data: {
      user: updated,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.createUsers = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not yet defined',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Don't Update Passwords with this. use /passwordRest instead
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
