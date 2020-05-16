require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
/* const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport      = require('passport');
const User          = require("./models/user"); */


mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error('Error connecting to mongo', err);
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

/* passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleID: profile.id })
        .then(user => {
          if (user) {
            done(null, user);
            return;
          }

          User.create({ googleID: profile.id, username: profile.displayName })
            .then(newUser => {
              done(null, newUser);
            })
            .catch(err => done(err)); // closes User.create()
        })
        .catch(err => done(err)); // closes User.findOne()
    }
  )
); */

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Setup authentication session
app.use(
  session({
    secret: "basic-auth-secret",
    cookie: {
      max: 60000
    }, // cookie living on the browser
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      resave: true,
      saveUninitialized: false,
      ttl: 24 * 60 * 60, // 1 day
    }),
  })
);

/* passport.serializeUser((user, callback) => {
  callback(null, user);
});

passport.deserializeUser((user, callback) => {
  callback(null, user);
});

app.use(passport.initialize());
app.use(passport.session()); */
// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));


// register partials
hbs.registerPartials(path.join(__dirname, '/views/partials'));

// BOOTSTRAP SETUP
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// SUMMERNOTE SETUP
app.use('/css', express.static(__dirname + '/node_modules/summernote/src/styles'));

app.use('/js', express.static(__dirname + '/node_modules/summernote/src/js'));

// FAVICONS
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Second Home';

// add auth routes
const auth = require('./routes/auth-routes');
app.use('/', auth);

const listings = require('./routes/listing-routes');
app.use('/', listings);

const private = require('./routes/private-routes');
app.use('/', private);

const index = require('./routes/index');
app.use('/', index);


module.exports = app;