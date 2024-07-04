/*
 * Import and Implement all the Routes
 */
const localRoutes = require('./localRoutes');
const githubRoutes = require('./githubRoutes');
const facebookRoutes = require('./facebookRoutes');
const googleRoutes = require('./googleRoutes');
const twitterRoutes = require('./twitterRoutes');

module.exports = function (app, passport) {
  localRoutes(app, passport);
  githubRoutes(app, passport);
  facebookRoutes(app, passport);
  googleRoutes(app, passport);
  twitterRoutes(app, passport);
};
