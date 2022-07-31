var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
const { hasSubscribers } = require('diagnostics_channel');
var hbs=require('express-handlebars')
var app = express();
const bodyParser=require('body-parser')
var cookieParser = require('cookie-parser');

var session=require('express-session')
const {check,validationResult}= require('express-validator')
var db=require('./config/connection')



db.connect((err)=>{
  if(err)console.log("connection error"+err);
  else console.log("database connected");

})
// //Database connection using mongoose

// const mongoose=require('mongoose')
// mongoose.connect('mongodb://localhost:27017',{useNewUrlParser : true})

// const db=mongoose.connection
// db.on('error',error=>console.error(error))
// db.once('open',()=>console.log('Connected to db successfull'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key",
resave:false,
saveUninitialized:true,
cookie:{maxAge:200000}}))

//hbs security open



//Routes 
app.use('/admin', adminRouter);
app.use('/', usersRouter);
app.use('/users', usersRouter);

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
