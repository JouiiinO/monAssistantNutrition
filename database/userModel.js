const mongoose = require('mongoose');

const users = new mongoose.Schema({
  facebook_id: String,
});

exports.buildModel = () => {
  mongoose.model('users', users);
};
