const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

// mongoose to use promise library
mongoose.Promise = global.Promise; 

let dbUri;
if (process.env.DATABASE_URL)
  dbUri = DATABASE_URL
else 
  dbUri = require('./config').dbUri;
require('./models').connect(dbUri);

// Setting up express
const app = express();

// use create-react-app build files and serve them
app.use(express.static(path.join(__dirname, '/../client/build')));

//http parsers
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Save all data via sockets
const server = http.createServer(app);
const io = socketIo(server);
require('./sockets')(io);

const port = 3001;

server.listen(port, () => {
  console.log('We are live on ' + port);
});