module.exports = {
  /*
   * Middleware to check if the User session is active and valid
   * If not then do not show that page, redirect to index
   */
  isLoggedIn: function (req, res, next) {
    if (req.isAuthenticated()) return next();

    res.redirect('/');
  },

  /*
   * Middleware to check if the User session is active and valid
   * If logged in, then do not show the page requested, redirect to dashboard
   * Eg: To restrict the user from seeing the login page, if already logged in
   */
  redirectLoggedIn: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
    } else {
      return next();
    }
  },
};
