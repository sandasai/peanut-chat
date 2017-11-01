const util = require('./util');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Room = mongoose.model('Room');
const Message = mongoose.model('Message');

function getTopMessages (io, room) {
  return Room.findOne({ name: room }).exec()
    .then(roomDb => {
      return Message.find({ room: roomDb })
              .populate('user', 'name')
              .populate('room', 'name')
              .sort('-rating').limit(3).exec();
    })
    .then(messages => {
      messages = messages.map((message) => {
        return {
          message: message.message,
          date: message.date,
          rating: message.rating,
          room: message.room.name,
          user: message.user.name,
          id: message._id,
        }
      });
      io.to(room).emit('sent top messages', messages);
    })
}

module.exports = {
  name: 'leaderboard',
  on: {
    'connection': function (io, socket, room) {
      return getTopMessages(io, room);
    },
    'rate message': function (io, socket, room, data) {
      return getTopMessages(io, room);
    },
  }
}