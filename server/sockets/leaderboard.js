const util = require('./util');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Room = mongoose.model('Room');

const roomCreationMsg = 'Room still being created'

// Returns a promise that resolves an array of scores
function getLeaderboard (io, room) {
  const socketsInRoom = util.getSocketsInRoom(io, room)
  let queries = []
  return Room.findOne({ name: room }).exec()
    .then(roomDb => {
      if (!roomDb)
        return Promise.reject(roomCreationMsg)
      return roomDb;
    })
    .then(roomDb => {
      queries = socketsInRoom.map((socket) => {
        console.log('Username: ', socket.username, '| Room name ', roomDb.name)
        return User.findOne({ name: socket.username, room: roomDb.name }).populate('messages')
      })
      return Promise.all(queries)
    })
    .then(values => {
      return values.map(user => {
        return {
          username: user.name,
          xp: user.xp,
          messages: user.messages.length
        }
      }).sort((a, b) => {
        if (a.xp > b.xp) {
          return -1;
        } else
          return 1;
      })
    })
    .catch(err => {
      console.log(err)
      if (err === roomCreationMsg)
        return;
      else Promise.reject(err)
    })
  }

module.exports = {
  name: 'leaderboard',
  on: {
    'connection': function (io, socket, room) {
      return getLeaderboard(io, room)
        .then(scores => {
          io.to(room).emit('updated leaderboard', scores)
        })
    },
    'send message': function (io, socket, room, data) {
      return getLeaderboard(io, room)
        .then(scores => {
          io.to(room).emit('updated leaderboard', scores)
        })
    },
    'rate message': function (io, socket, room, data) {
      return getLeaderboard(io, room)
        .then(scores => {
          io.to(room).emit('updated leaderboard', scores)
        })
    },
  }
}