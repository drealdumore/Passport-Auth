const passport = require('passport');
const GitHUbStrategy = require('passport-github');

const User = require('../models/user');

module.exports = function (app) {
  passport.use(
    new GitHUbStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.LOCAL_HOST + '/auth/github/callback',
        passReqToCallback: true,
      },
      function (req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
          if (!req.user) {
            /*
             * Not logged in
             * Search if Github Id Exists
             */
            User.findOne({ 'github.id': profile.id }, function (err, user) {
              if (err) return done(err);

              if (user) {
                if (!user.github.token) {
                  /*
                   * Github Id exists but no token
                   * Means we are re-connecting an unlinked Github account
                   */
                  user.github.token = token;
                  user.github.name = profile.displayName;
                  user.github.username = profile.username;
                  user.github.email = profile.email || '';
                  user.save(function (err) {
                    if (err) throw err;
                    return done(null, user);
                  });
                }
                /*
                 * Github Id exists, Authenticate that user account to the session
                 */
                return done(null, user);
              } else {
                /*
                 * No existing matching user found
                 * Fresh login
                 * Create new account with Github credentials
                 */
                var newUser = new User();

                newUser.github.id = profile.id;
                newUser.github.token = token;
                newUser.github.name = profile.displayName;
                newUser.github.username = profile.username;
                newUser.github.email = profile.email || '';

                newUser.save(function (err) {
                  if (err) throw err;
                  return done(null, newUser);
                });
              }
            });
          } else {
            /*
             * Already logged in, means we are connecting Github account to an existing user.
             * Means we have arrived via the /connect/github route
             */
            var user = req.user; // Get user data from the session

            user.github.id = profile.id;
            user.github.token = token;
            user.github.name = profile.displayName;
            user.github.username = profile.username;
            user.github.email = profile.email || '';

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
