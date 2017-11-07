const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');

/* prevents message from being send */
module.exports = {
  name: 'timeout',
  on: {
    'send message': function (io, socket, room, data) {
      if (!socket.roomSettings.timeout)
        return Promise.resolve();

      return User.findOne({ name: socket.username, room: room }).exec()
        .then(user => {
          // check if user on a timer
          const currentDate = new Date();
          console.log(currentDate.getTime(), user.timeout, user.lastMessageSendDate.getTime(), currentDate.getTime() - user.timeout < user.lastMessageSendDate.getTime())
          if (currentDate.getTime() - user.timeout < user.lastMessageSendDate.getTime()) {
            // user cannot send message yet, stop propagation of message
            return Promise.reject(`User cannot send a message yet: Timeout - ${user.timeout}, Time between messages - ${currentDate.getTime() - user.lastMessageSendDate.getTime()}`);
          }
          return user;
        })
        .then(user => {
          // Place user on a timer
          user.lastMessageSendDate = new Date();
          let timeout = (45 - user.level) * 1000;
          if (timeout < 0)
            timeout = 0;
          user.timeout = timeout;
          return user.save()
        })
        .then(user => {
          // emit timer events to the user telling them when they can send a message
          let timeleft = user.timeout;
          let interval = setInterval(() => {
            socket.emit('sent message timer', timeleft);
            timeleft = timeleft - 1000;
            if (timeleft < 0)
              clearInterval(interval)
          }, 1000)
        })
    },
    // Rating currenly uses same timeout algorithm
    'rate message': function (io, socket, room, data) {

      //check if timeout is added for this room
      if (!socket.roomSettings.timeout)
        return Promise.resolve();

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
        })
        .then(() => User.findOne({ name: socket.username, room: room }).exec())
        .then(user => {
          const currentDate = new Date();
          if (currentDate.getTime() - user.ratingTimeout < user.lastRatingDate.getTime()) {
            return Promise.reject(`User cannot rate a message yet: Timeout - ${user.ratingTimeout}, Time between messages - ${currentDate.getTime() - user.lastRatingDate.getTime()}`)
          }
          return user;
        })
        .then(user => {
          user.lastRatingDate = new Date();
          let timeout = (45 - user.level) * 1000;
          if (timeout < 0)
            timeout = 0;
          user.ratingTimeout = timeout;
          return user.save()
        })
        .then(user => {
          console.log('rating user', user)
          let timeleft = user.ratingTimeout;
          let interval = setInterval(() => {
            socket.emit('rated timer', timeleft);
            timeleft = timeleft - 1000;
            if (timeleft < 0)
              clearInterval(interval)
          }, 1000)
        });
    }
  }
}