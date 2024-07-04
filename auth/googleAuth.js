const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

const User = require('../models/user');

module.exports = function (app) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.LOCAL_HOST + '/auth/google/callback',
        passReqToCallback: true,
      },
      function (req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
          if (!req.user) {
            /*
             * Not logged in
             * Search if Google Id Exists
             */
            User.findOne({ 'google.id': profile.id }, function (err, user) {
              if (err) return done(err);

              if (user) {
                if (!user.google.token) {
                  /*
                   * Google Id exists but no token
                   * Means we are re-connecting an unlinked Google account
                   */
                  user.google.token = token;
                  user.google.name = profile.displayName;
                  user.google.email = profile.emails[0].value; // pull the first email

                  user.save(function (err) {
                    if (err) throw err;
                    return done(null, user);
                  });
                }
                /*
                 * Google Id exists, Authenticate that user account to the session
                 */
                return done(null, user);
              } else {
                /*
                 * No existing matching user found
                 * Fresh login
                 * Create new account with Google credentials
                 */
                var newUser = new User();

                newUser.google.id = profile.id;
                newUser.google.token = token;
                newUser.google.name = profile.displayName;
                newUser.google.email = profile.emails[0].value; // pull the first email

                newUser.save(function (err) {
                  if (err) throw err;
                  return done(null, newUser);
                });
              }
            });
          } else {
            /*
             * Already logged in, means we are connecting Google account to an existing user.
             * Means we have arrived via the /connect/google route
             */
            var user = req.user; // Get user data from the session

            user.google.id = profile.id;
            user.google.token = token;
            user.google.name = profile.displayName;
            user.google.email = profile.emails[0].value;

            user.save(function (err) {
              if (err) throw err;
              return done(null, user);
            });
          }
        });
      }
    )
  );
};
