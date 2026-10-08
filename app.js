var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var logger = require('morgan');
var config = require('./app_server/config');
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
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- START: API & CORS Setup for Angular ---

// 2. Enable CORS: allows the Angular app to talk to this server.
// Set CORS_ORIGIN to your frontend URL in production (defaults to * for local development).
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", config.corsOrigin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') return res.sendStatus(204); // answer CORS preflight
    next();
});

// --- END: API & CORS Setup for Angular ---


// Serve the built Angular app when it exists (single-service deploy); otherwise the legacy Jade pages.
var angularDist = ['app_public/dist/app_public/browser', 'app_public/dist/app-public/browser']
    .map(function(p) { return path.join(__dirname, p); })
    .find(function(p) { return fs.existsSync(path.join(p, 'index.html')); });
if (angularDist) {
    app.use(express.static(angularDist));
} else {
    app.use('/', indexRouter);
}
// 3. Mount User Routes under /api: All your API calls from Angular will start with /api
// e.g., /api/register, /api/login, /api/driver/location
app.use('/api', usersRouter); 
app.use('/api/reviews', reviewsRouter); // Mount Reviews Routes under /api/reviews
app.use('/api/locations', locationsRouter); // Mount Locations Routes under /api/locations
app.use('/api/coordinates', coordinatesRouter); // Mount Coordinates Routes under /api/coordinates


// Unknown API routes return JSON 404s
app.use('/api', function(req, res) {
  res.status(404).json({ error: 'Not found' });
});

// SPA fallback: let Angular's router handle every other GET
if (angularDist) {
  app.get('*', function(req, res) {
    res.sendFile(path.join(angularDist, 'index.html'));
  });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  if (req.originalUrl.startsWith('/api')) {
    // e.g. malformed JSON body -> 400 JSON instead of an HTML page
    return res.json({ error: err.status && err.status < 500 ? err.message : 'Internal server error' });
  }
  // render the error page
  res.render('error');
});

module.exports = app;
