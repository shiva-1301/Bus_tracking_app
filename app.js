var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// 1. Load the database connection and Mongoose models
require('./app_server/models/db'); 

var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users'); // Contains Auth and API routes
var reviewsRouter = require('./app_server/routes/reviews'); // Reviews API routes
var locationsRouter = require('./app_server/routes/locations'); // Locations API routes
var coordinatesRouter = require('./app_server/routes/coordinates'); // Coordinates API routes

var app = express();

// view engine setup
app.set('views', path.join(__dirname,'app_server','views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- START: API & CORS Setup for Angular ---

// 2. Enable CORS: Allows your Angular app to talk to this server
app.use((req, res, next) => {
    // We use "*" to allow access from any origin, which is common in development.
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

// --- END: API & CORS Setup for Angular ---


app.use('/', indexRouter); 
// 3. Mount User Routes under /api: All your API calls from Angular will start with /api
// e.g., /api/register, /api/login, /api/driver/location
app.use('/api', usersRouter); 
app.use('/api/reviews', reviewsRouter); // Mount Reviews Routes under /api/reviews
app.use('/api/locations', locationsRouter); // Mount Locations Routes under /api/locations
app.use('/api/coordinates', coordinatesRouter); // Mount Coordinates Routes under /api/coordinates


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
