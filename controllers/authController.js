//import module crypto
const crypto = require('crypto');

//import node modules for async jwt verify
const {promisify} = require('util');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');

//import appError module
const AppError = require('./../utils/appError');

//import module from sendEmail
const Email = require('./../utils/email');

const signToken = id => {
	//get id of user, JWT_SECRET, JWT_EXPIRES_IN
	return jwt.sign({id}, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});
}

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	
	//set cookie expiration
	const cookieOptions = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
		//using httpOnly to prevent xss attack
		httpOnly: true,
	}
	
	//set https when productions
	// if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
	
	//set cookie for jwt 
	res.cookie('jwt', token, cookieOptions);
	
	//remove password from response body
	user.password = undefined
	
	res.status(statusCode)
		.json({
			status: 'success',
			token,
			data: {
				user
			}
		});
}

exports.signup = catchAsync(async(req,res,next) => {
	//it will improve a sign up role cause using req.body without check user can input role admin
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm
	});

	const url = `${req.protocol}://${req.get('host')}/me`;
	// console.log(url);

	//using our email handler to send welocme email
	await new Email(newUser, url).sendWelcome()

	//log user in, send jwt
	createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async(req,res,next) => {
	//using destructuring
	const {email, password} = req.body;
	
	//1. check if email and password exist
	if(!email || !password){
		return next(new AppError('Please provide email and password',400));
	}
	
	//2. check if user exists && password is correct
	//select a password manually so we can display it because in usermodel password select is false
	const user = await User.findOne({email}).select('+password');
	
	if(!user || !(await user.correctPassword(password, user.password))){
		return next(new AppError('Incorrect email or password', 401));
	}
	
	//old version you can use createSendToken if you want
	//3. if everything is oke, send token to client
	// const token = signToken(user._id);
	
	// res.status(200).json({
	// 	status: 'success',
	// 	token
	// });

	//log user in, send jwt
	createSendToken(user, 200, res);
});

exports.protect = catchAsync(async(req,res,next) => {
	//1. getting token and check of it's there
	let token;
    
    //check header authorization with bearer is exist
	if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
		token = req.headers.authorization.split(' ')[1];
	}
	else if(req.cookies.jwt){
		token = req.cookies.jwt
	}
	
	if(!token){
		return next(new AppError('You are not logged in! please login to get access',401));
	}
	
	//2. verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);
	
	//3. Check if user still exists
	const currentUser = await User.findById(decoded.id);
	if(!currentUser){
		return next(new AppError('The user belonging to this token does no longer exist', 401));
	}
	
	//4. Check if user changed password after the token was issued
	if(currentUser.changedPasswordAfter(decoded.iat)){
		return next(new AppError('User recently changed password! please log in again',401));
	}
	
	//GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	res.locals.user = currentUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req,res,next) => {
		//save all roles to roles variable return array
		//roles ['admin','lead-guide'] , role='user'
		
		//check roles of user when accessing route 
		//ex: if user pass roles user it will dont be allowed to access this route
		//cause user roles not in array of roles can access this middleware 
		//check tourRoutes to find what roles we pass
		//accessing req.user.role from before middleware
		if(!roles.includes(req.user.role)){
			return next(new AppError('You dont have permission to perform this action',403))
		}
		next();
	}
}

exports.forgotPassword = catchAsync(async (req,res,next) => {

	if(!req.body.email){
		return next(new AppError('We cant proceed without email address',400));
	}

	//1. get user based on posted email
	const user = await User.findOne({email: req.body.email});

	//check if user empty
	if(!user){
		return next(new AppError('There is no user with email address', 404));
	}
	
	//2. generate the random reset token
	const resetToken = user.createPasswordResetToken();
	
	//turn off validations before save
	await user.save({validateBeforeSave: false})
	
	//3. send it to user's email
	try {
		const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
		await new Email(user,resetURL).sendPasswordReset();
		res.status(200).json({
			status: 'success',
			message: 'token sent to email'		
		});
	} catch(err){
		//return to undefined if there is an error where send email
		user.passwordResetToken = undefined;
		user.passwordResetExpires =  undefined;
		await user.save({validateBeforeSave: false})
		
		return next(new AppError('there was an error sending the email. try again later',500));
	}
});

exports.resetPassword = catchAsync(async (req,res,next) => {
	//1. get user based on the token
	//encrypt token from req.params to compare it with database cause in database we encrypt it
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
	
	//find user with token and passwordResetExpires greater than Date.now() 
	//remember we issued a token with expired 10 minutes, if more than 10 minutes it expired
	//if less than 10 minutes it will return data to user
	const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});
	
	//2. if token has not expired and there is a user, set the new password
	if(!user){
		return next(new AppError('Token is invalid or has expired',400));
	}
	
	//set data from req body to document , set undefined to passwordResetExpires and passwordResetToken and then save it
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();
	
	//3. update changedpasswordat property for the user
	//4. log the user in send jwt
	const token = signToken(user._id);
	
	res.status(200).json({
		status: 'success',
		token
	});
});

exports.updatePassword = catchAsync(async (req,res,next) => {
	//1. get user from collection
	//req.user is from authController.protect
	const user = await User.findById(req.user.id).select('+password');
	
	//2. check if posted current password is correct
	//current password must same with user data in database before updating to new password
	if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
		return next(new AppError('Your current password is wrong', 401));
	}
	
	//3. if so, update password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();
	//User.findByIdAndUpdate will NOT work as intended
	
	//4. log user in, send jwt
	createSendToken(user, 200, res);
});

//for rendered pages , there will be no error
exports.isLoggedIn = async (req,res, next) => {
	if(req.cookies.jwt){
		try{
			//1.verify token
			const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
		
			//2. check if user still exists
			const currentUser = await User.findById(decoded.id);
			if(!currentUser){
				return next();
			}
		
			//3. check if user changed password after the token was issued
			if(currentUser.changedPasswordAfter(decoded.iat)){
				return next();
			}
			
			//4.there is a logged in user
			//add a new key to defined a user login or not then send it to response so pug template can use it
			//and it will convert it to variable like a render function
			res.locals.user = currentUser;
			return next();
		}
		catch(err){
			return next();
		}
	}
	next();
}

exports.logout = (req,res) => {
	res.cookie('jwt','logged out',{
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	});
	res.status(200).json({status:'success'});
};