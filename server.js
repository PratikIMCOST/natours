const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection Successufully');
  });

console.log(process.env.NODE_ENV);

const port = 3000;

const server = app.listen(port, () => console.log(`Server is running on port ${port}`));

process.on('unhandledRejection', (err) => {
  console.log(err.name);
  console.log('UNCAUGHT REJECTION 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
