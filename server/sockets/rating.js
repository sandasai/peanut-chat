const mongoose = require('mongoose');
const User = mongoose.model('User');
const util = require('./util');

module.exports = {
  name: 'rating',
  on: {
    'connection': function (io, socket, room) {
      //Pull up profile information if it exists, send it back
      return User.findOne({ name: socket.username, room }).then(user => {
        if (user) {
          const { level, xp, messages } = user;
          socket.emit('updated profile', { level, xp, nextLevelXp: xp + level + 1, messageCount: messages.length })      
        }
      })
    },
    'send message': function (io, socket, room, data) {
      return User.findOne({ name: socket.username, room }).then(user => {
        io.to(socket.id).emit('updated profile', { messageCount: user.messages.length });        
      })
    },
    'rate message': function (io, socket, room, data) {
      const { id, rating } = data;
      return Message.findById(data.id).populate('user')
        .then(message => {
          // check if rating comes from same user              
          if (socket.username === message.user.name) {
            return Promise.reject('User cannot rate own message');            
          }

          // check if user has already rated this
          if (message.ratedBy[socket.userId])
            return Promise.reject('User has already rated this message');
          
          message.ratedBy[socket.userId] = true;              

          // apply rating
          if (rating === 'up')
            message.rating = message.rating + 1;
          else if (rating === 'down')
            message.rating = message.rating - 1;
          else {
            return Promise.reject(`Invalid rating applied: ${rating}`); 
          }

          // used by mongoose to mark something that needs to be saved
          message.markModified('rating');
          return message.save();
        })
        .then(message => {
          return Message.findById(data.id).then(m => {
            return message;
          });
        })
        .then(message => {
          io.to(room).emit('rated message', {
            id: message._id,
            rating: message.rating,
          });
          return message;
        })
        .then(message => {
          return User.findById(message.user._id).populate('messages').then(user => {
            user.updateXP();
            user.updateLevel();
            return user;
          });
        })
        .then(user => {
          const socketId = util.getSocketIdFromUsername(io, room, user.name);
          const { level, xp, nextLevelXp, startLevelXp } = user;
          io.to(socketId).emit('updated profile', { level, xp, nextLevelXp, startLevelXp });
        })
        .catch(err => {
          socket.emit('rate message error', err)
          return Promise.resolve()
        })
    }
  }
}