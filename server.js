const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

//save connection string and replace password text to env database password
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.PASSWORD);

//options to deal with some deprecation warnings (recommended)
//if connection success it will return a object to the console
//if success comment in con.connections and change con to ()
mongoose.connect(DB, {
  useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true,
  useFindAndModify: false,
}).then(con => {
	console.log(con.connections);
	console.log('DB CONNECTION SUCCESFULY');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
