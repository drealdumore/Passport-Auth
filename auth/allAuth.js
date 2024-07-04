/*
 * Import and Implement all the Authentication functions
 */
const localAuth = require('./localAuth');
const githubAuth = require('./githubAuth');
const facebookAuth = require('./facebookAuth');
const googleAuth = require('./googleAuth');
const twitterAuth = require('./twitterAuth');

module.exports = function (app) {
  localAuth(app);
  githubAuth(app);
  facebookAuth(app);
  googleAuth(app);
  twitterAuth(app);
};
