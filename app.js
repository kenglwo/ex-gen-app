var express = require('express'),
	createError = require('http-errors'),
	logger = require('morgan'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	path = require('path'),
	fs = require('fs-extra'),
	rfs = require('rotating-file-stream'),
	indexRouter = require('./routes/index'),
	hello = require('./routes/hello'),
	wordcloud = require('./routes/wordcloud'),
	wordcloud2 = require('./routes/wordcloud2'),
	noresultRouter = require('./routes/noresult'),
	compareRouter = require('./routes/compare'),
	overviewRouter = require('./routes/overview'),
	visualizeRouter = require('./routes/visualize'),
	reactRouter = require('./routes/react');

var session_opt = {
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 60 * 60 * 1000 },
};

var jquery = require('express-jquery');
// var ajax = require('./routes/ajax');

var app = express();

// view engine setup process
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(nocache())

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(session_opt));
app.use(jquery('/jquery'));
// app.use('/ajax', ajax);

app.use('/', indexRouter);
app.use('/noresult', noresultRouter);
app.use('/hello', hello);
app.use('/wordcloud', wordcloud);
app.use('/wordcloud2', wordcloud2);
app.use('/compare', compareRouter);
app.use('/overview', overviewRouter);
app.use('/visualize', visualizeRouter);
app.use('/react', reactRouter);

var logDirectory = path.join(__dirname, './log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = rfs('access.log', {
	size: '10MB',
	interval: '10d',
	compress: 'gzip',
	path: logDirectory,
});
var preformat = ':date[clf] - :method :url - :response-time ms';
app.use(
	logger(preformat, {
		stream: accessLogStream,
	})
);

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
