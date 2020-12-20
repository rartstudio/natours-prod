//import node modules
const path = require('path');

const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes')


//import module rateLimit
const rateLimit = require('express-rate-limit');

//import module helmet
const helmet = require('helmet');

//import module mongo sanitize
const mongoSanitize = require('express-mongo-sanitize');

//import xss module
const xss = require('xss-clean');

//import module http parameter pollution
const hpp = require('hpp');

const cookieParser = require('cookie-parser');

//import our appError class
const AppError = require('./utils/appError');

//import our global eroor handler before appError
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//set our server side engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set security http header
app.use(helmet());

//development logging
if(process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

//limit request from same api
//is to allow 100 request from the same IP in one hour
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api',limiter);

//body parser, reading data from body into req.body
app.use(express.json({limit: '50mb'}));

//using url encoded
app.use(express.urlencoded({extended: true, limit: '10kb'}));

//pass data from cookie
app.use(cookieParser());

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization against xss
app.use(xss());

//prevent parameter pollution
app.use(hpp({
	//give a white list cause duration we want to using between
	whitelist: ['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}));



//app.use(express.static(`${__dirname}/public`));

//test middleware
app.use((req,res,next) => {
	req.requestTime = new Date().toISOString();
	// console.log(req.cookies)
	next();
})

//a global middleware running before all routes
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req,res,next) => {
	//res.status(404).json({
	//	status: 'fail',
	//	message: `cant find on ${req.originalUrl}this server`
	//});
	
	//using a global error handling middleware
	//const err = new Error(`cant find on ${req.originalUrl}this server`);
	//err.status = 'fail';
	//err.statusCode = 404;
	
	//if we pass an variabel err to next function
	//express will know there is an error
	//next(err);
	
	//using our class appError
	next(new AppError(`cant find ${req.originalUrl} on this server`,404));
});

app.use(globalErrorHandler);

module.exports = app;
