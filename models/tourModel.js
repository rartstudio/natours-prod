const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal then 40 characters'],
      minLength: [10, 'A tour name must have more or equal then 10 characters']
      //using external library for validate
      // validate: [validator.isAlpha,'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
      min: 1
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1.0'],
      max: [5, 'rating must be below 5.0'],
      //add setter, setter will be run each time that a new value is set for this field
      //we multiply it by 10 and divide 10 so we can get a value like 4.7
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    //custom validators
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      //remove a space from left and right of text
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image cover']
    },
    //an array with value string
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
      //hide a created at from user
      //select: false
    },
    //start date of tours
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    //using embedded documents
    startLocation: {
      //geoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      //array of numbers
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    //embedding tour guides
    // guides: Array

    //child referencing tour guides
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//we add index on model
//we add index more performant when querying data
//-1 or 1 its doesnt matter
//1 is an ascending order
//-1 is descending order

//compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });

//normal index
tourSchema.index({ slug: 1 });

//convert it to index 2dsphere
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//document middleware : runs before save() and create()
tourSchema.pre('save', function(next) {
  //this will be point currently process
  //console.log(this);

  //add a new item before save
  this.slug = slugify(this.name, { lower: true });

  next();
});

//do a embedding for guides when save
// tourSchema.pre('save',async function(next){
// 	//find detail of user by id from req.body
// 	//it will return a problem cause we return an array full of promises so we need to using promise all
// 	const guidesPromises = this.guides.map(async id => await User.findById(id));

// 	this.guides = await Promise.all(guidesPromises);
// 	next();
// })

//query middleware
//run before all find match text
//using reqular expression
//can run with : find findOne findOneAndDelete findOneAndRemove findOneAndUpdate
//add populate to getAllTour and getTour so we didnt need to have 2 same code

//using populate cause we do child referencing
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//run after all find match text
tourSchema.post(/^find/, function(docs, next) {
  // console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  //add a new item before save

  next();
});

//aggregation middleware
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});

//create model base on schema
const Tour = mongoose.model('Tour', tourSchema);

//export as a class
module.exports = Tour;
