const mongoose = require('mongoose');

//create schema of our tour collection
const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true
	},
	rating: {
		type: Number,
		default: 4.5
	},
	price : {
		type: Number,
		required : [true, 'A tour must have a price']
	}
});

//create model base on schema
const Tour = mongoose.model('Tour', tourSchema);

//export as a class
module.exports = Tour;