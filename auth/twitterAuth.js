const passport = require('passport');
const TwitterStrategy = require('passport-twitter');

const User = require('../models/user');

module.exports = function (app) {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CLIENT_ID,
        consumerSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: process.env.LOCAL_HOST + '/auth/twitter/callback',
        passReqToCallback: true,
      },
      function (req, token, tokenSecret, profile, done) {
        // asynchronous
        process.nextTick(function () {
          if (!req.user) {
            /*
             * Not logged in
             * Search if Twitter Id Exists
             */
            User.findOne({ 'twitter.id': profile.id }, function (err, user) {
              if (err) return done(err);

              if (user) {
                if (!user.twitter.token) {
                  /*
                   * Twitter Id exists but no token
                   * Means we are re-connecting an unlinked Twitter account
                   */
                  user.twitter.token = token;
                  user.twitter.username = profile.username;
                  user.twitter.displayName = profile.displayName;

                  user.save(function (err) {
                    if (err) throw err;
                    return done(null, user);
                  });
                }
                /*
                 * Twitter Id exists, Authenticate that user account to the session
                 */
                return done(null, user);
              } else {
                /*
                 * No existing matching user found
                 * Fresh login
                 * Create new account with Twitter credentials
                 */
                var newUser = new User();

                newUser.twitter.id = profile.id;
                newUser.twitter.token = token;
                newUser.twitter.username = profile.username;
                newUser.twitter.displayName = profile.displayName;

                newUser.save(function (err) {
                  if (err) throw err;
                  return done(null, newUser);
                });
              }
            });
          } else {
            /*
             * Already logged in, means we are connecting Twitter account to an existing user.
             * Means we have arrived via the /connect/twitter route
             */
            var user = req.user; // Get user data from the session

            user.twitter.id = profile.id;
            user.twitter.token = token;
            user.twitter.username = profile.username;
            user.twitter.displayName = profile.displayName;

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
