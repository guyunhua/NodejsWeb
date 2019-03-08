var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
 var bodyParser = require('body-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var multer = require('multer');
var mongoose = require('mongoose'),
DB_URL = 'mongodb://localhost:27017/nodedb';

var session = require('express-session');

global.dbHandle = require('./database/dbHandle');
global.db = mongoose.connect(DB_URL);

/**
  * 连接成功
  */
mongoose.connection.on('connected', function () {    
    console.log('Mongoose connection open to ' + DB_URL);  
});    

/**
 * 连接异常
 */
mongoose.connection.on('error',function (err) {    
    console.log('Mongoose connection error: ' + err);  
});    
 
/**
 * 连接断开
 */
mongoose.connection.on('disconnected', function () {    
    console.log('Mongoose connection disconnected');  
}); 

var app = express();
app.use(session({
	resave:false,
	saveUninitialized:true,
	secret: 'secret',
	cookie:{
		maxAge:1000*60*60
	}
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine("html",require("ejs").__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', indexRouter);
app.use('/register', indexRouter);
app.use('/home', indexRouter);
app.use('/logout', indexRouter);

app.use(bodyParser.urlencoded({extended:true}));
app.use(multer({dest:__dirname+'/resoucres/'}).any());
app.use(cookieParser());


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(function(req, res,next){
	res.locals.user = req.session.user;
	var err = req.session.error;
	delete req.session.error;
	res.locals.message = "";
	if(err){
		res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
	}
	res.render("message",{message: res.locals.message})
	next();
});

module.exports = app;
