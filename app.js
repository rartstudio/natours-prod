const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//import our appError class
const AppError = require('./utils/appError');

//import our global eroor handler before appError
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//a global middleware running before all routes
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
