const initialize = require('./sockets/initialize');
const messaging = require('./sockets/messaging');
const rating = require('./sockets/rating');
const leaderboard = require('./sockets/leaderboard')
const topMessages = require('./sockets/topMessages');

module.exports = function(io) {
  io.on('connection', socket => {
    const { username, room } = socket.handshake.query;    
 
    initialize.on['connection'](io, socket)
      .then(leaderboard.on['connection'](io, socket, room))
      .then(topMessages.on['connection'](io, socket, room))      
      .catch(err => {
        console.log(err)
      })

    socket.on('send message', data => {
      messaging.on['send message'](io, socket, room, data)
        .then(rating.on['send message'](io, socket, room, data))
        .then(leaderboard.on['send message'](io, socket, room ,data))
        .catch(err => {
          console.log(err)
        })
    });

    socket.on('rate message', data => {
      rating.on['rate message'](io, socket, room, data)
        .then(leaderboard.on['rate message'](io, socket, room, data))
        .then(topMessages.on['rate message'](io, socket, room, data))
        .catch(err => {
          console.log(err)
        })
    })
  });
};
