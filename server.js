const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// process.on('uncaughtException',err => {
// 	console.log('UNCAUGHT EXCEPTION');
// 	console.log(err.name, err.message);
// 	process.exit(1);
// });

const app = require('./app');

//save connection string and replace password text to env database password
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

//options to deal with some deprecation warnings (recommended)
//if connection success it will return a object to the console
//if success comment in con.connections and change con to ()
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    // console.log(con.connections);
    // console.log('DB CONNECTION SUCCESFULY');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// process.on('unhandledRejection', err => {
// 	console.log('UNHANDLED REJECTION');
// 	console.log(err.name, err.message);
// 	//closing server
// 	server.close(()=> {
// 		process.exit(1);
// 	});
// });
