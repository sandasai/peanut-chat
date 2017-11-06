const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Room = mongoose.model('Room');

module.exports = {
  name: 'auth',
  on: {
    'connection': function (io, socket, room) {
      const { password } = socket.handshake.query;
      return Room.findOne({ name: room }).exec()
        .then(roomDb => {
          return new Promise((resolve, reject) => {
            if (!roomDb)
              throw new Error('Room document does not exist');
            if (roomDb.password)
              bcrypt.compare(password, roomDb.password, (err, res) => {
                // password doesn't match
                if (!res) {
                  socket.emit('auth', { success: false, reason: 'Invalid room password' });
                  reject('Invalid room password');
                } else {
                  resolve();
                }
              });
            else
              resolve()
          });
        });
    }
  }
}