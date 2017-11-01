const util = require('./util');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Room = mongoose.model('Room');

let connectionno = 0;


function connection (io, socket) {
  console.log('connection number: ' + connectionno++);
  const { room, username } = socket.handshake.query;
  if (!room || !username) {
    console.log(new Error('Client side error, room and username are not included in socket handshake'))
    return Promise.reject('Client side error, room and username are not included in socket handshake');
  }
  // check if room exists
  if (!io.sockets.adapter.rooms[room]) {
    socket.username = username;
    socket.join(room);
  }

  // check if user is taken
  const socketsIds = util.getSocketIds(io, room);
  for (let socketId in socketsIds) {
    console.log(socketsIds)
    if (io.sockets.connected[socketId].username === username) {
      socket.emit('auth', { success: false, reason: 'Username already taken' });          
      return Promise.reject('Username already taken');          
    }
  }
  socket.username = username;
  socket.join(room);
  console.log('gets here')
  socket.emit('auth', { success: true, username });

  return new Promise((resolve, reject) => {
    // Find the user if it exists, if not create user
    User.findOne({ name: username, room })
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
      .then(Room.findOne({ name: room }))
      .then(roomDb => {
        // A room has been found
        if (roomDb)
          return Promise.resolve();
        // If room hasn't been found create a new one
        else {
          let newRoom = new Room({
            name: room,
            users: [],
            messages: [],
          });
          return newRoom.save();
        }
      })
      .catch(err => {
        socket.emit('connection error', err)
        return Promise.reject(err)
      });
  })
}



// Checks whether the room and username exists on the handshake
// If username is not already taken in the room,
// sets the username, userID property on the socket object and joins the room
// Creates a user in the database if new user, Creates a room in database if new room
module.exports = {
  name: 'initailize',
  on: {
    'connection': connection
  }
}