const mongoose = require('mongoose');
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema(
	{
		review : {
			type: String,
			required: [true, 'Review can not be empty']
		},
		rating: {
			type: Number,
			min: 1,
			max: 5
		},
		createdAt: {
			type: Date,
			default: Date.now
		},
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'Review must be belong to a tour']
		},
		user : {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must be belong to a user']
		}
	},
	{
		toJson: {virtuals: true},
		toObject: {virtuals: true}
	}
);

//add compund index to prevent duplicate review
reviewSchema.index({tour:1, user: 1}, {unique: true});

//chain 2 reference
// reviewSchema.pre(/^find/, function(next){
// 	this.populate({
// 		path: 'tour',
// 		select : 'name'
// 	}).populate({
// 		path: 'user',
// 		select: 'name photo'
// 	});
	
// 	next();
// });

reviewSchema.pre(/^find/, function(next){
	this.populate({
		path: 'user',
		select: 'name photo'
	});
	
	next();
});

//using static methods on our schema
reviewSchema.statics.calcAverageRatings = async function(tourId){
	//using aggregation pipeline
	//this point to directly document
	const stats = await this.aggregate([
		{
			$match: { tour : tourId }
		},
		{
			$group: {
				//group by tour
				_id: '$tour',
				//give a each of that value 1
				nRating: {$sum : 1},
				avgRating: {$avg: '$rating'}
			}
		}
	]);
	// console.log(stats);
	
	if(stats.length > 0){
		//update a ratings average and avg rating on tour
		await Tour.findByIdAndUpdate(tourId,{ratingsQuantity: stats[0].nRating, ratingsAverage: stats[0].avgRating});
	}
	else {
		//update a ratings average and avg rating on tour
		await Tour.findByIdAndUpdate(tourId,{ratingsQuantity: 0, ratingsAverage: 4.5});
	}
}

reviewSchema.post('save', function(next){
	//this points to current review
	this.constructor.calcAverageRatings(this.tour);
});

//FOR UPDATING AND DELETING REVIEWS
//findByIdAndDelete
//findByIdAndUpdate
reviewSchema.pre(/^findOneAnd/, async function (next) {
	//we save it to object document so we can access it on post
	this.r = await this.findOne();
	next();
});

reviewSchema.post(/^findOneAnd/, async function(){
	//await this.findOne() does not work here, query has already executed
	//running calcAverageRatings based on data pre middleware
	await this.r.constructor.calcAverageRatings(this.r.tour)
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;