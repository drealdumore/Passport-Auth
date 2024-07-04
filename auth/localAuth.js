const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('../models/user');

module.exports = function (app) {
  /*
   * Use Local Strategy and Verify Login credentials
   */
  passport.use(
    'local-login',
    new LocalStrategy(
      {
        /*
         * By default, local strategy uses username and password
         * Overiding to use email address
         */
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        // asynchronous
        process.nextTick(function () {
          User.findOne({ 'local.email': email }, function (err, user) {
            if (err) return done(err);

            // User does not exist
            if (!user)
              return done(
                null,
                false,
                req.flash('loginMessage', 'No user found.')
              );

            // Password does not match
            if (!user.validPassword(password))
              return done(
                null,
                false,
                req.flash('loginMessage', 'Oops! Wrong password.')
              );
            else return done(null, user);
          });
        });
      }
    )
  );

  /*
   * Use Local Strategy and Register new User if Email does not exist
   */
  passport.use(
    'local-register',
    new LocalStrategy(
      {
        /*
         * By default, local strategy uses username and password
         * Overiding to use email address
         */
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        // asynchronous
        process.nextTick(function () {
          //  Check if email address already in use
          User.findOne({ 'local.email': email }, function (err, existingUser) {
            if (err) return done(err);

            // If already exists, then redirect with message.
            if (existingUser)
              return done(
                null,
                false,
                req.flash('registerMessage', 'That email is already taken.')
              );

            if (req.user) {
              /*
               * If already logged in, then link new email address to the User's account.
               * Means we have arrived via the /connect/local route
               */
              var user = req.user;
              user.local.email = email;
              user.local.password = user.generateHash(password);
              user.save(function (err) {
                if (err) throw err;
                return done(null, user);
              });
            } else {
              /*
               * Not logged in
               * Arrived via /register route
               * Create new User account with Email
               */

              var newUser = new User();

              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);

              newUser.save(function (err) {
                if (err) throw err;

                return done(null, newUser);
              });
            }
          });
        });
      }
    )
  );
};
