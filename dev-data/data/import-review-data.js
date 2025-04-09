const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: 'config.env' });

const Review = require('./../../models/reviewModel');

// connect to database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connected Successfully!'))
  .catch((err) => console.log(`💥ERROR: ${err}`));

// read data form the review file
const reviewData = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// create import function
const importReviews = async function () {
  try {
    await Review.create(reviewData);
    console.log('Reviews Imported successfully!');
  } catch (err) {
    console.log(`💥ERROR: ${err}`);
  }
  process.exit();
};

// create delete function
const deleteReviews = async function () {
  try {
    await Review.deleteMany();
    console.log('Reviews Deleted successfully!');
  } catch (err) {
    console.log(`💥ERROR: ${err}`);
  }
  process.exit();
};

// impliment run command on environment bases
if (process.argv[2] === '--import') importReviews();
if (process.argv[2] === '--delete') deleteReviews();
