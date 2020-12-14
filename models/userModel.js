const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//import module from node crypto
const crypto = require('crypto');

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
	role : {
		type: String,
		enum: ['user','guide','lead-guide','admin'],
		default: 'user'
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
	passwordChangedAt: Date,
	//field for password reset token for comparing
	passwordResetToken: String,
	//field for password reset expires
	passwordResetExpires: Date, 

	active : {
		type: Boolean,
		default: true,
		select: false
	}
});

userSchema.pre(/^find/, function(next){
	//this points to current query
	this.find({active: {$ne : false}});
	next();
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

userSchema.pre('save', function(next){
	if(!this.isModified('password') || this.isNew) return next();
	
	this.passwordChangedAt = Date.now() - 1000;
	// this.passwordChangedAt = Date.now();
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

userSchema.methods.createPasswordResetToken = function () {
	
	//create reset token
	//32 is length of reset token
	//change it to string with format hex
	const resetToken = crypto.randomBytes(32).toString('hex');
	
	//we set to user database with password hashed
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	//add expired 10 minutes
	this.passwordResetExpires = Date.now() + 10 * 60 *1000;

	//we sent to client with non hash random bytes
	return resetToken;
}

const User = mongoose.model('User',userSchema);

module.exports = User;