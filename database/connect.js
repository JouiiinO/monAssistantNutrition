// load .env
require('dotenv').config();

// Bring Mongoose into the app
const mongoose = require('mongoose');

// Build the connection string
const dbURI = process.env.MONGODB_URI;

// Models
const product = require('./productModel.js');
const userModel = require('./userModel.js');

exports.start = (callback = null) => {
  // Create the database connection
  mongoose.connect(dbURI);

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.on('connected', () => {
    console.log(`Mongoose default connection open to ${dbURI}`);
    if (callback) {
      callback();
    }
  });

  // If the connection throws an error
  mongoose.connection.on('error', (err) => {
    console.log(`Mongoose default connection error: ${err}`);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });

  // MODELS
  product.buildModel();
  userModel.buildModel();
};
