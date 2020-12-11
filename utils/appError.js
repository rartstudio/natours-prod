class AppError extends Error {
	constructor (message, statusCode){
		//call a parent constructor
		//a parent just receive an error string with just one parameter
		//set a incoming message error
		super(message);
		
		this.statusCode = statusCode;
		
		//check status code if starts with 4 or etc
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		
		//error operational
		this.isOperational = true;
		
		//argument we passed
		//this -> is current object
		//this.constructor -> is our AppError class
		Error.captureStackTrace(this,this.constructor);
	}
}

module.exports = AppError;