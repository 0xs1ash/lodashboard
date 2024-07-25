const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: "Can not be empty" },
  username: { type: String, required: "Can not be empty",unique: true},
  email: { type: String, required: "Can not be empty",unique: true},
  linkedin_profile: { type: String },
  github_profile: { type: String},
  resume: { type: String },
  password: { type: String, required: true },
  isAdmin: { type: Boolean}
});


module.exports = mongoose.model('User', UserSchema);
