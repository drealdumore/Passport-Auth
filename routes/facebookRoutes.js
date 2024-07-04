// Import Authentication checking middleware functions
const check = require('./authCheck');

module.exports = function (app, passport) {
  /*
   * If no session is active
   * Process the authentication of Facebook user account to the applications session
   */
  app.get(
    '/auth/facebook',
    passport.authenticate('facebook', { scope: 'email' })
  );

  // Handle callback from Facebook
  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
    })
  );

  /*
   * If session already active
   * Just authorize the Facebook user account to existing applications session
   */
  app.get(
    '/connect/facebook',
    passport.authorize('facebook', { scope: 'email' })
  );

  // Handle callback from Facebook
  app.get(
    '/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
    })
  );

  // Unlink/Disconnect Facebook account from the User Account
  app.get('/unlink/facebook', check.isLoggedIn, function (req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function (err) {
      res.redirect('/dashboard');
    });
  });
};
