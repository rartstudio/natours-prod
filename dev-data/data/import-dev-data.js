const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.PASSWORD);

mongoose
	.connect(DB, {
        useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(()=> console.log('DB connection successfull'));


//read json file
//in fs ./ is refer to root folder
//so we need to use __dirname to check current folder
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));


//IMPORT DATA INTO DB
const importData = async () => {
	try {
		await Tour.create(tours);
		await User.create(users, {validateBeforeSave: false});
		await Review.create(reviews);
		console.log('Data successfully loaded')
	}
	catch(err) {
		console.log(err);
	}
	process.exit();
}

//DELETE ALL DATA FROM DB
const deleteData = async () => {
	try {
		await Tour.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();
		console.log('data successfully deleted');
	}
	catch (err) {
		console.log(err);
	}
	process.exit();
}

//choose 2 cause --import or --delete on third argument 
if(process.argv[2] === '--import'){
	importData();
}
else if (process.argv[2] === '--delete'){
	deleteData();
}


console.log(process.argv);
//result on array
//'usr/local/bin/node' from node of first argument
//'folder/import-dev-data.js' from seconde argument
//'--import' from third argument