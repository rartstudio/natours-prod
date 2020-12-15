const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/APIFeatures');

//CATCHING ERRORS IN ASYNC FUNCTIONS
//import catchAsync module
const catchAsync = require('./../utils/catchAsync');

//import appError
// const AppError = require('./../utils/appError');

//import handlerfactory
const factory = require('./handlerFactory');

//prefilling limit, sort ,fields
exports.aliasTopTours = (req,res,next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
}

exports.getAllTours = factory.getAll(Tour);

//path is where field we want to populate , in this case we want to populate field reviews
exports.getTour = factory.getOne(Tour, {path: 'reviews'});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

//AGGREGATION PIPELINE MATCHING AND GROUPING
exports.getTourStats = catchAsync(async(req,res,next) => {
	const stats = await Tour.aggregate([
		{$match : {ratingsAverage: {$gte: 4.5}}},
		{
			$group: {
				_id: {$toUpper: '$difficulty'},
				numTours: {$sum: 1},
				numRatings: {$sum: '$ratingsQuantity'},
				avgRating: {$avg: '$ratingsAverage'},
				avgPrice: {$avg: '$price'},
				minPrice: {$min: '$price'},
				maxPrice: {$max: '$price'}
			}
		},
		{$sort : { avgPrice: 1}}
	]);

	res.status(200).json({
		status: 'success',
		data: {
			stats
		}
	});
});


//AGGREGATION PIPELINE UNWINDING AND PROJECTING
exports.getMonthlyPlan = catchAsync (async (req,res) => {
	const year = req.params.year * 1;
	//extracting an array of startdates become one for an object,
	//so when have a 3 data on startDates array
	//it will destructured to object with same tours with different startdates array from data
	const plan = await Tour.aggregate([
		{
			$unwind: '$startDates'
		},
		{
			$match: {
				startDates : {
					$gte : new Date(`${year}-01-01`),
					$lte : new Date(`${year}-12-31`)
				}
			}
		},
		{
			$group : {
				_id: {$month: '$startDates'},
				// _id: null,
				numTourStarts: { $sum: 1},
				tours: { $push: '$name'}
			}
		},
		{
			$addFields : { month: '$_id'}
		},
		{
			$project : { _id: 0 }
		},
		{
			$sort: { numTourStarts : -1}
		},
		{
			$limit:12
		}
	]);

	res.status(200)
		.json({
			status: 'success',
			data: {
				plan
			}
		});
});


// exports.createTour = async (req, res) => {
// 	try {
// 		const newTour = await Tour.create(req.body);
// 		res.status(201)
// 			.json({
// 				status: 'success',
// 				data : {
// 					tour: newTour
// 				}
// 			});
// 	} catch (err) {
// 		res.status(400)
// 			.json({
// 				status: 'fail',
// 				message: err
// 			})
// 	}
// }

// exports.getAllTours = async (req, res) => {
// 	try{
// 		//EXECUTE QUERY
// 		const features = new APIFeatures(Tour.find(), req.query)
// 					.filter()
// 					.sort()
// 					.limitFields()
// 					.paginate()
					
// 		const tours = await features.query;
	
// 		//SEND RESPONSE
// 		res.status(200).json({
// 			status: 'success',
// 			results: tours.length,
// 			data : {
// 				tours
// 			}
// 		});
// 	}
// 	catch(err){
// 		res.status(404).json({
// 			status: 'fail',
// 			message: err
// 		});
// 	}
// }

// exports.getTour = async (req,res) => {
// 	try {
// 		//id from what we name it on route binding
// 		//findById is short hand
// 		//long version: Tour.findOne({_id: req.params.id})
// 		const tour = await Tour.findById(req.params.id);
// 		res.status(200)
// 			.json({
// 				status: 'success',
// 				data: {
// 					tour
// 				}
// 			});
// 	}
// 	catch (err) {
// 		res.status(400)
// 			.json({
// 				status: 'fail',
// 				message: err
// 			})
// 	}
// }

// exports.updateTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour
//       }
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err
//     });
//   }
// };

// exports.deleteTour = async (req,res) => {
// 	try {
// 		const tour = await Tour.findByIdAndDelete(req.params.id);
		
// 		res.status(204)
// 			.json({
// 				status: 'success',
// 				data : null
// 			});
// 	}
// 	catch(err) {
// 		res.status(400)
// 			.json({
// 				status: 'fail',
// 				message: err
// 			});
// 	}
// }

//exports.getTourStats = async (req,res) => {
	// 	try {
	// 		//basically like group and order by in mysql
	// 		const stats = await Tour.aggregate([
	// 			{
	// 				$match: {ratingsAverage: {$gte: 4.5}}
	// 			},
	// 			{
	// 				$group: {
	// 					_id: {$toUpper: '$difficulty'},
	// 					// _id: null,
	// 					numTours : { $sum: 1},
	// 					numRatings: {$sum : '$ratingsQuantity'},
	// 					avgRating: {$avg: '$ratingsAverage'},
	// 					avgPrice: {$avg : '$price'},
	// 					minPrice: {$min: '$price'},
	// 					maxPrice: {$max: '$price'}
	// 				}
	// 			},
	// 			{
	// 				$sort: { avgPrice: 1 }
	// 			},
	// 			// {
	// 			// 	$match: { _id: { $ne : 'EASY'}}
	// 			// }
	// 		]);
			
	// 		res.status(200)
	// 			.json({
	// 				status: 'success',
	// 				data: {
	// 					stats
	// 				}
	// 			});
		
	// 	}
	// 	catch (err) {
	// 		res.status(404)
	// 			.json({
	// 				status: 'fail',
	// 				message: err
	// 			});
	// 	}
	// }

//AGGREGATION PIPELINE UNWINDING AND PROJECTING
// exports.getMonthlyPlan = async (req,res) => {
// 	try {
// 		const year = req.params.year * 1;
// 		//extracting an array of startdates become one for an object,
// 		//so when have a 3 data on startDates array
// 		//it will destructured to object with same tours with different startdates array from data
// 		const plan = await Tour.aggregate([
// 			{
// 				$unwind: '$startDates'
// 			},
// 			{
// 				$match: {
// 					startDates : {
// 						$gte : new Date(`${year}-01-01`),
// 						$lte : new Date(`${year}-12-31`)
// 					}
// 				}
// 			},
// 			{
// 				$group : {
// 					_id: {$month: '$startDates'},
// 					// _id: null,
// 					numTourStarts: { $sum: 1},
// 					tours: { $push: '$name'}
// 				}
// 			},
// 			{
// 				$addFields : { month: '$_id'}
// 			},
// 			{
// 				$project : { _id: 0 }
// 			},
// 			{
// 				$sort: { numTourStarts : -1}
// 			},
// 			{
// 				$limit:12
// 			}
// 		]);

// 		res.status(200)
// 			.json({
// 				status: 'success',
// 				data: {
// 					plan
// 				}
// 			});
// 	}
// 	catch (err){
// 		res.status(404)
// 			.json({
// 				status: 'fail',
// 				message: err
// 			});
// 	}

// }


// exports.deleteTour = catchAsync(async(req,res,next) => {
// 	const tour = await Tour.findByIdAndDelete(req.params.id);
	
// 	if(!tour){
// 		return next(new AppError('No tour found with that id', 404));
// 	}

// 	res.status(204).json({
// 		status: 'success',
// 		data: null
// 	});
// });

// exports.updateTour = catchAsync(async(req,res,next) => {
// 	const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
// 		new: true,
// 		runValidators: true	
// 	});

// 	if(!tour){
// 		return next(new AppError('No tour found with that id', 404));
// 	}

// 	res.status(200).json({
// 		status: 'success',
// 		data: {
// 			tour
// 		}
// 	});
// });

// exports.getTour = catchAsync(async(req,res,next) => {
// 	// const tour = await Tour.findById(req.params.id);
// 	//we do populate reviews when user get data of one tour
// 	const tour = await Tour.findById(req.params.id).populate('reviews');


// 	if(!tour){
// 		return next(new AppError('No tour found with that id', 404));
// 	}
	
// 	res.status(200).json({
// 		status: 'success',
// 		data: {
// 			tour
// 		}
// 	});
// });

// exports.createTour = catchAsync(async (req,res,next) => {
// 	const newTour = await Tour.create(req.body);
	
// 	res.status(201).json({
// 		status: 'success',
// 		data: {
// 			tour: newTour
// 		}
// 	});
// });


// exports.getAllTours = catchAsync(async(req,res,next) => {
// 	const features = new APIFeatures(Tour.find(), req.query)
// 		.filter()
// 		.sort()
// 		.limitFields()
// 		.paginate();
	
// 	const tours = await features.query;
	
// 	//send response
// 	res.status(200).json({
// 		status: 'success',
// 		results: tours.length,
// 		data: {
// 			tours
// 		}
// 	});
// });
