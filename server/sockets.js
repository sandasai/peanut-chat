const initialize = require('./sockets/initialize');
const messaging = require('./sockets/messaging');
const rating = require('./sockets/rating');
const leaderboard = require('./sockets/leaderboard')
const topMessages = require('./sockets/topMessages');
const timeout = require('./sockets/timeout');
const auth = require('./sockets/auth');

module.exports = function(io) {
  io.on('connection', socket => {
    const { username, room, password } = socket.handshake.query;    
 
    auth.on['connection'](io, socket, room)
      .then(() => initialize.on['connection'](io, socket, room))
      .then(() => leaderboard.on['connection'](io, socket, room))
      .then(() => topMessages.on['connection'](io, socket, room))      
      .catch(err => {
        socket.disconnect(true);
        console.log(err)
      })

    socket.on('send message', data => {
      timeout.on['send message'](io, socket, room, data)
        .then(() => messaging.on['send message'](io, socket, room, data))
        .then(() => rating.on['send message'](io, socket, room, data))
        .then(() => leaderboard.on['send message'](io, socket, room ,data))
        .catch(err => {
          console.log(err)
        })
    });

    socket.on('rate message', data => {
      rating.on['rate message'](io, socket, room, data)
        .then(() => leaderboard.on['rate message'](io, socket, room, data))
        .then(() => topMessages.on['rate message'](io, socket, room, data))
        .catch(err => {
          console.log(err)
        })
    })
  });
};
