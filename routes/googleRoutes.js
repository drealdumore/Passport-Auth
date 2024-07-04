// Import Authentication checking middleware functions
const check = require('./authCheck');

module.exports = function (app, passport) {
  /*
   * If no session is active
   * Process the authentication of Google user account to the applications session
   */
  app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  // Handle callback from Google
  app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
    })
  );

  /*
   * If session already active
   * Just authorize the Google user account to existing applications session
   */
  app.get(
    '/connect/google',
    passport.authorize('google', { scope: ['profile', 'email'] })
  );

  // Handle callback from Google
  app.get(
    '/connect/google/callback',
    passport.authorize('google', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
    })
  );

  // Unlink/Disconnect Google account from the User Account
  app.get('/unlink/google', check.isLoggedIn, function (req, res) {
    var user = req.user;
    user.google.token = undefined;
    user.save(function (err) {
      res.redirect('/dashboard');
    });
  });
};
