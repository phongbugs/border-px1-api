var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var authenticationRouter = require('./routes/authentication');
var infoRouter = require('./routes/info');
var deploymentRouter = require('./routes/deployment');

const bodyParser = require('body-parser');
//var busboy = require('connect-busboy');
var app = express();

const swaggerUi = require('swagger-ui-express');
// default api document of app 
const swaggerDocumentFileName = './swagger.json';
const swaggerDocument = require(swaggerDocumentFileName);
// extra api document of 3rd party
const swaggerDocumentGH = require('./swagger_GH_SW.json');
const swaggerDocumentPP = require('./swagger_PP_SW.json');

const fhs = (hString) => {
  if (hString.length % 2 == 0) {
    var arr = hString.split('');
    var y = 0;
    for (var i = 0; i < hString.length / 2; i++) {
      arr.splice(y, 0, '\\x');
      y = y + 3;
    }
    return arr.join('');
  } else {
    console.log('formalize failed');
  }
};
const h2a = (h) => {
  var str = '';
  for (var i = 0; i < h.length; i += 2) {
    var v = parseInt(h.substr(i, 2), 16);
    if (v) str += String.fromCharCode(v);
  }
  return str;
};
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(busboy());
// const cors = require('cors');
// //app.use(cors())
// app.use(cors({
//   origin : "http://localhost:9999",
//   credentials: true,
// }))

app.use(function (req, res, next) {
  var allowedDomains = [
    h2a(fhs('687474703a2f2f6c6f63616c686f73743a39393939')),
    h2a(fhs('687474703a2f2f6c6f63616c686f7374')),
    h2a(
      fhs(
        '68747470733a2f2f626f726465722d7078312d6170692e6865726f6b756170702e636f6d'
      )
    ),
    h2a(fhs('687474703a2f2f6d61696e74656e616e63652e6c6967613336352e636f6d')),
    h2a(fhs('68747470733a2f2f6d61696e74656e616e63652e6c6967613336352e636f6d')),
    h2a(fhs('687474703a2f2f6d61696e74656e616e6365322e6c6967613336352e636f6d')),
    h2a(
      fhs('68747470733a2f2f6d61696e74656e616e6365322e6c6967613336352e636f6d')
    ),
    'https://ata-push-api.xyz',
    'http://localhost:8888',
    'http://192.168.2.185:8888',
    'https://border-px1-api.herokuapp.com',
    'https://noichu.com',
  ];
  var origin = req.headers.origin;
  if (allowedDomains.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, content-type, accept, authorization'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  //res.removeHeader('x-frame-options');
  //delete res.headers['x-frame-options'];
  next();
});
//app.use(require('./auth'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api-docs-gh', swaggerUi.serve, swaggerUi.setup(swaggerDocumentGH));
app.use('/api-docs-pp', swaggerUi.serve, swaggerUi.setup(swaggerDocumentPP));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/authentication', authenticationRouter);
app.use('/info', infoRouter);
app.use('/deployment', deploymentRouter);

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
