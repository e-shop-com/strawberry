var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var userSchema = new mongoose.Schema({
  givenName: String,
  familyName: String,
  profileId: String,
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('user', userSchema);
