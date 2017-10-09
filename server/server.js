const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

const config = require('./config');

// mongoose to use promise library
mongoose.Promise = global.Promise; 

require('./models').connect(config.dbUri);

// Setting up express
const app = express();

//http parsers
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Save all data via sockets, NOT restful api
const server = http.createServer(app);
const io = socketIo(server);
require('./sockets')(io);

const port = 3001;

server.listen(port, () => {
  console.log('We are live on ' + port);
});