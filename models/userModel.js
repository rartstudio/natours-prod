const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please tell us your name']
	},
	email: {
		type: String,
		required: [true, 'Please provide your email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	photo: {
		type: String	
	},
	password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        //hiding this column from response
        select: false
    },
    //add validation to check password is same with confirm password
    passwordConfirm : {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //this only work on .save() and .create()
            validator: function(el) {
                return el === this.password; //abc === abc ? true : false
            },
            message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: Date
});

//that we receive that data and the moment where it's actually persisted to the database
//and we will do encryption password
userSchema.pre('save', async function(next){
    //only run this function if password was actually modified
    //it always return true check docs on mongoose
	if(!this.isModified('password')) return next();
	
	//encrypt our password
	//hash the password with cost of 12 (salt for encrypting)
	this.password = await bcrypt.hash(this.password,12)
	
	//set password confirm to undefined
	//and it will not persisted to database
	this.passwordConfirm = undefined;
	next();
});

//add after userSchema.pre('save')
//create a instance method basically that is gonna be available on all documents of a certain collections
//this function will correctPassword from input cause a one we have is hash

//candidatePassword is from req.body
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
	//comparing password from req.body and userPassword from database . it will return true or false
	return await bcrypt.compare(candidatePassword,userPassword);
}

//add timestamp for user if changed password
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
	if(this.passwordChangedAt){
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
		
		return JWTTimeStamp < changedTimestamp
	}
	
	//false mean not changed
	return false
}

const User = mongoose.model('User',userSchema);

module.exports = User;