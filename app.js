var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const CASAuthentication = require('node-cas-authentication');
const exphbs = require('express-handlebars');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.engine('hbs', exphbs({extname: '.hbs'}));
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let cas = new CASAuthentication({
  cas_url     : 'http://127.0.0.1:8000/cas',
  service_url : 'http://127.0.0.1:5000',
  cas_version     : '3.0',
  renew           : false,
  is_dev_mode     : false,
  dev_mode_user   : '',
  dev_mode_info   : {},
  session_name    : 'cas_user',
  session_info    : 'cas_userinfo',
  destroy_session : false
});


app.use( session({
  secret            : 'nodejs-cas-client-demo',
  resave            : false,
  saveUninitialized : true
}));


//app.use('/', indexRouter);
//app.use('/users', usersRouter);


app.use(function(req, res, next){
  if(req.session[ cas.session_name ]){
    res.locals.isAuthenticated = true;
    res.locals.username = req.session[ cas.session_name ];
  }
  next();
})

app.get('', (req,res)=>{
  res.render('home');
})


app.get( '/secret', cas.bounce, function ( req, res ) { 
  res.render('secret', )
});

app.get( '/app1', function ( req, res ) {
  res.send( '<html><body>Hello!</body></html>' );
});

// app.post( '/logout', cas.logout, (req, res)=>{
//   res.locals.isAuthenticated = false;
//   res.redirect('/')
// });
app.get( '/login', cas.bounce, (req, res)=>{

  res.redirect("/")
});
app.post( '/logout', cas.logout);



app.get( '/api/user', cas.block, function ( req, res ) {
  console.log(req.session);
  res.json( { cas_user: req.session[ cas.session_name ] } );
});



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
