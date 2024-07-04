// Import Authentication checking middleware functions
const check = require('./authCheck');

module.exports = function (app, passport) {
  /*
   * If no session is active
   * Process the authentication of Github user account to the applications session
   */
  app.get('/auth/github', passport.authenticate('github'));

  // Handle callback from Github
  app.get(
    '/auth/github/callback',
    passport.authenticate('github', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
    })
  );

  /*
   * If session already active
   * Just authorize the Github user account to existing applications session
   */
  app.get('/connect/github', passport.authorize('github'));

  // Handle callback from Github
  app.get(
    '/connect/github/callback',
    passport.authorize('github', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
    })
  );

  // Unlink/Disconnect Github account from the User Account
  app.get('/unlink/github', check.isLoggedIn, function (req, res) {
    var user = req.user;
    user.github.token = undefined;
    user.save(function (err) {
      res.redirect('/dashboard');
    });
  });
};
