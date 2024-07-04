const passport = require('passport');
const FacebookStrategy = require('passport-facebook');

const User = require('../models/user');

module.exports = function (app) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.LOCAL_HOST + '/auth/facebook/callback',
        passReqToCallback: true,
      },
      function (req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
          if (!req.user) {
            /*
             * Not logged in
             * Search if Facebook Id Exists
             */
            User.findOne({ 'facebook.id': profile.id }, function (err, user) {
              if (err) return done(err);

              if (user) {
                if (!user.facebook.token) {
                  /*
                   * Facebook Id exists but no token
                   * Means we are re-connecting an unlinked Facebook account
                   */
                  user.facebook.token = token;
                  user.facebook.name = profile.displayName;
                  user.facebook.email = profile.email;

                  user.save(function (err) {
                    if (err) throw err;
                    return done(null, user);
                  });
                }
                /*
                 * Facebook Id exists, Authenticate that user account to the session
                 */

                return done(null, user);
              } else {
                /*
                 * No existing matching user found
                 * Fresh login
                 * Create new account with Facebook credentials
                 */
                var newUser = new User();

                newUser.facebook.id = profile.id;
                newUser.facebook.token = token;
                newUser.facebook.name = profile.displayName;
                newUser.facebook.email = profile.email;

                newUser.save(function (err) {
                  if (err) throw err;
                  return done(null, newUser);
                });
              }
            });
          } else {
            /*
             * Already logged in, means we are connecting Facebook account to an existing user.
             * Means we have arrived via the /connect/facebook route
             */
            var user = req.user; // Get user data from the session

            user.facebook.id = profile.id;
            user.facebook.token = token;
            user.facebook.name = profile.displayName;
            user.facebook.email = profile.email;

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
