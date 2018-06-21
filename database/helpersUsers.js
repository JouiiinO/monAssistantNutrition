const mongoose = require('mongoose');

const createUser = (userFbId, callback) => {
  const Users = mongoose.model('users');

  new Users({ facebook_id: userFbId }).save((err, user) => {
    console.log(user);
    callback();
  });
};

exports.createUser = createUser;

// return user object or false
const getUserByFacebookid = (userFbId, callback) => {
  const Users = mongoose.model('users');

  Users.find({ facebook_id: userFbId }, 'id facebook_id', (err, user) => {
    if (err) console.log(err);

    // if no user
    if (user.length === 0) {
      callback(false);
    }
    callback(user);
  });
};

exports.getUserByFacebookid = getUserByFacebookid;
