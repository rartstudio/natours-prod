//import module user and catchAsync
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const multer = require('multer');

//import app error module
const AppError = require('./../utils/appError');

//import handlerfactory
const factory = require('./handlerFactory');

//set a storage to save image
const multerStorage = multer.diskStorage({
	//set destination of image
	destination: (req, file, callback) => {
		callback(null, 'public/img/users');
	},
	filename: (req, file, callback) => {
		//format file
		//user-userid-currenttimestamp.jpeg
		const ext = file.mimetype.split('/')[1];
		callback(null,`user-${req.user.id}-${Date.now()}.${ext}`);
	}
}); 

const multerFilter = (req,file,callback) => {
	//checking image is image or not
	//everything ext image like jpeg jpg png or gif will start with image/ext
	if(file.mimetype.startsWith('image')){
		callback(null,true)
	}
	else {
		callback(new AppError('Not an image! please upload only images', 400), false);
	}
}

//configure multer upload
const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	
	//Object.keys will return an array of key name
	Object.keys(obj).forEach(el => {
		//if true we assign it value to newObj
		if(allowedFields.includes(el)) newObj[el] = obj[el]
	});
	return newObj;
}

exports.uploadUserPhoto = upload.single('photo');

exports.updateMe = catchAsync(async (req,res,next) => {
	//test upload image
	console.log(req.file);
	console.log(req.body);
	//1. create error if user POST password data
	if(req.body.password || req.body.passwordConfirm) {
		return next(new AppError('This route is not for password updates. please use /updateMyPassword',400));
	}
	
	//2. filtered out unwanted fields names that are not allowed to be updated
	//filteredBoy return a object
	const filteredBody = filterObj(req.body, 'name', 'email');

	//if there's an image
	if(filteredBody) filteredBody.photo = req.file.filename;
	
	//3. Update user document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new:true, runValidators: true});
	
	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser
		}
	});
});

exports.deleteMe = catchAsync(async(req,res,next) => {
	await User.findByIdAndUpdate(req.user.id, {active: false});
	
	res.status(204).json({
		status: 'success',
		data: null
	});
});

exports.getMe = (req,res,next) => {
	req.params.id = req.user.id;
	next();
}

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

// exports.getAllUsers = catchAsync(async(req,res,next) => {
// 	const users = await User.find();
	
// 	res.status(200).json({
// 		status: 'success',
// 		results: users.length,
// 		data: {
// 			users
// 		}
// 	});
// });

// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };