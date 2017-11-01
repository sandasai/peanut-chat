const middlewareInitialize = require('./sockets/initialize');
const middlewareMessaging = require('./sockets/messaging');
const middlewareRating = require('./sockets/rating');
const middlewareLeaderboard = require('./sockets/leaderboard')

module.exports = function(io) {
  io.on('connection', socket => {
    const { username, room } = socket.handshake.query;    
 
    middlewareInitialize.on['connection'](io, socket)
      .then(middlewareLeaderboard.on['connection'](io, socket, room))
      .catch(err => {
        console.log(err)
      })

    socket.on('send message', data => {
      middlewareMessaging.on['send message'](io, socket, room, data)
        .then(middlewareRating.on['send message'](io, socket, room, data))
        .then(middlewareLeaderboard.on['send message'](io, socket, room ,data))
        .catch(err => {
          console.log(err)
        })
    });

    socket.on('rate message', data => {
      middlewareRating.on['rate message'](io, socket, room, data)
        .catch(err => {
          console.log(err)
        })
    })
  });
};
