const bcrypt = require('bcrypt');
const util = require('./util');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Room = mongoose.model('Room');

let connectionno = 0;

function connection (io, socket, data) {
  console.log('connection number: ' + connectionno++);
  const { room, username, password } = socket.handshake.query;
  if (!room || !username) {
    console.log(new Error('Client side error, room and username are not included in socket handshake'))
    return Promise.reject('Client side error, room and username are not included in socket handshake');
  }

  // check if user is taken
  const socketsIds = util.getSocketIds(io, room);
  for (let socketId in socketsIds) {
    if (io.sockets.connected[socketId].username === username) {
      socket.emit('auth', { success: false, reason: 'Username already taken' });          
      return Promise.reject('Username already taken');          
    }
  }

  socket.username = username;
  socket.join(room);

  socket.emit('auth', { success: true, username });
    // Find the user if it exists, if not create user
  return User.findOne({ name: username, room })
    .then(user => {
      if (user)
        return user;
      else {
        let newUser = new User({
          name: username,
          room: room,
          messages: [],
        });
        return newUser.save()
      }
    })
    .then(user => {
      socket.userId = user._id;          
    })
    .then(() => Room.findOne({ name: room }).exec())
    .then(roomDb => {
      // A room has been found
      if (roomDb) {
        // Store room settings so that it can be accessed in other modules
        socket.roomSettings = {
          timeout: roomDb.timeout
        };

        return new Promise((resolve, reject) => {
          if (!roomDb.password || roomDb.password === '')
            resolve();
          // Need to compare passwords for the room
          else {
            bcrypt.compare(password, roomDb.password, (err, res) => {
              if (res)
                resolve()
              else
                reject('Invalid password for the room')
            })
          }
        })
      }
      // If room hasn't been found, we have an error. Should already be created in http routing
      else {
        throw new Error("Room hasn't been created yet")
      }
    })
    .catch(err => {
      socket.emit('connection error', err)
      return Promise.reject(err)
    });
}

/**
 * Checks whether the room and username exists on the handshake
 * If username is not already taken in the room,
 *  - sets property roomSettings on socket object
 *  - sets properties on socket object: the username, userID property
 *  - Creates a user in the database if new user, Creates a room in database if new room
 *  - joins the room
 */
module.exports = {
  name: 'initailize',
  on: {
    'connection': connection
  }
}