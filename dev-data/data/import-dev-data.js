const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

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
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));


//import data into DB
const importData = async () => {
	try{
		await Tour.create(tours);
		console.log('Data Successfully loaded');
		//do it with wise cause it will impact of real application
		process.exit();
	}
	catch(err){
		console.log(err);
	}
}

//delete all data from db
const deleteData = async () => {
	try {
		await Tour.deleteMany();
		console.log('Data successfully deleted!');
		//do it with wise cause it will impact of real application
		process.exit();
	}
	catch (err){
		console.log(err);
	}
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