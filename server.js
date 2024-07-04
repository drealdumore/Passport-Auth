'use strict';

const https = require('https');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const flash = require('connect-flash');
// Import all Authentication Functions
const auth = require('./auth/allAuth');
// Import all the Routes
const routes = require('./routes/allRoutes');
// Using dotenv to setup Environment Variables
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Import User Model
const User = require('./models/user');

app.use('/', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.use(flash());

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log('Database error: ' + err);
    } else {
      console.log('Successful database connection');

      app.use(
        session({
          secret: process.env.SESSION_SECRET,
          resave: true,
          saveUninitialized: true,
        })
      );

      // Initialise the Authentication Module
      app.use(passport.initialize());
      // For persistent sessions
      app.use(passport.session());

      passport.serializeUser(function (user, done) {
        done(null, user.id);
      });

      passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
          done(err, user);
        });
      });

      // Implement all the Authentication Functions
      auth(app);
      // Implement all the routes
      routes(app, passport);

      // Incase an invalid route is detected
      app.use((req, res, next) => {
        res.status(404).type('text').send('Not Found');
      });

      /*
       * Recommended to use https, as Facebook login requires the domain to be HTTPS,
       * even for development environments
       */
      https
        .createServer(
          {
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.cert'),
          },
          app
        )
        .listen(process.env.PORT || 3000, () => {
          console.log('Listening on port ' + process.env.PORT);
        });

      /*
       * For http server, below can be used instead
       */
      /*
        app.listen(process.env.PORT || 3000, () => {
          console.log('Listening on port ' + process.env.PORT);
        });
      */
    }
  }
);
