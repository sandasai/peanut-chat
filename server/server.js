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
  dbUri = process.env.DATABASE_URL;
else 
  dbUri = require('./config').dbUri;
require('./models').connect(dbUri);

// Setting up express
const app = express();

// NOTE, during development, build client. Uses create-react-app build files and serve them. 
app.use(express.static(path.join(__dirname, '/../client/build')));

// http parsers
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use routes
app.use('/', require('./routes'));

// Save all data via sockets
const server = http.createServer(app);
const io = socketIo(server);
require('./sockets')(io);

const port = (process.env.PORT || 5000)

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/../client/build/index.html'));
});

server.listen(port, () => {
  console.log('We are live on ' + port);
});