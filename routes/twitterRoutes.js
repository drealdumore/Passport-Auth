// Import Authentication checking middleware functions
const check = require('./authCheck');

module.exports = function (app, passport) {
  /*
   * If no session is active
   * Process the authentication of Twitter user account to the applications session
   */
  app.get(
    '/auth/twitter',
    passport.authenticate('twitter', { scope: 'email' })
  );

  // Handle callback from Twitter
  app.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
    })
  );

  /*
   * If session already active
   * Just authorize the Twitter user account to existing applications session
   */
  app.get(
    '/connect/twitter',
    passport.authorize('twitter', { scope: 'email' })
  );

  // Handle callback from Twitter
  app.get(
    '/connect/twitter/callback',
    passport.authorize('twitter', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
    })
  );

  // Unlink/Disconnect Twitter account from the User Account
  app.get('/unlink/twitter', check.isLoggedIn, function (req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.save(function (err) {
      res.redirect('/dashboard');
    });
  });
};
