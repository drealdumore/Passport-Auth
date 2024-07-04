// Import Authentication checking middleware functions
const check = require('./authCheck');

module.exports = function (app, passport) {
  // Index page - only if not logged in
  app.get('/', check.redirectLoggedIn, function (req, res) {
    res.render('index');
  });

  // User Profile details page - only if logged in
  app.get('/profile', check.isLoggedIn, function (req, res) {
    res.render('profile', {
      user: req.user,
    });
  });

  // User Dashboard page - only if logged in
  app.get('/dashboard', check.isLoggedIn, function (req, res) {
    res.render('dashboard', {
      user: req.user,
    });
  });

  // Logout from the active session
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // Login page
  app.get('/login', check.redirectLoggedIn, function (req, res) {
    res.render('login', { message: req.flash('loginMessage') });
  });

  // Process the Login Form
  app.post(
    '/login',
    passport.authenticate('local-login', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
      failureFlash: true,
    })
  );

  // Register new user account using email
  app.get('/register', check.redirectLoggedIn, function (req, res) {
    res.render('register', { message: req.flash('registerMessage') });
  });

  // Process the Register Form
  app.post(
    '/register',
    passport.authenticate('local-register', {
      successRedirect: '/dashboard',
      failureRedirect: '/register',
      failureFlash: true,
    })
  );

  /*
   * If user has logged in via Social Logins then show page to connect
   * Local Email Account
   */
  app.get('/connect/local', check.isLoggedIn, function (req, res) {
    res.render('connect-local', {
      user: req.user,
      message: req.flash('registerMessage'),
    });
  });

  // Process Local Email Account Linking
  app.post(
    '/connect/local',
    passport.authenticate('local-register', {
      successRedirect: '/dashboard',
      failureRedirect: '/connect/local',
      failureFlash: true,
    })
  );

  // Unlink User's local email account
  app.get('/unlink/local', check.isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/dashboard');
    });
  });
};
