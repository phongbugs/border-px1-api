var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var authenticationRouter = require('./routes/authentication');
var infoRouter = require('./routes/info');

const bodyParser = require('body-parser');
const cors = require('cors');

var app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocumentFileName = './swagger.json';
const swaggerDocument = require(swaggerDocumentFileName);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(cors())
// app.use(cors({
//   origin : "http://localhost:9999",
//   credentials: true,
// }))
// app.use(function (req, res, next) {
//   var allowedDomains = ['http://localhost:9999','maintenance.liga365.com' ];
//   var origin = req.headers.origin;
//   if(allowedDomains.indexOf(origin) > -1){
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }

//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   next();
// })
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/authentication', authenticationRouter);
app.use('/info', infoRouter);

// catch 404 and forward to error handler
app.use(function (_, _, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, _) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
