const mongoose = require('mongoose');

const User = mongoose.model('User');
const Room = mongoose.model('Room');
const Message = mongoose.model('Message');

module.exports = function(io) {
  /**
   * Returns the socket ids of all sockets in room
   * @param {string} room room to check
   * @returns {object} sockets
   */
  function getSocketsInRoom(room) {
    return io.sockets.adapter.rooms[room].sockets;
  }

  /**
   * Initialize a user. Returns false is there are errors.
   * @param {*} username 
   * @param {*} room 
   */
  function initializeSocket(socket) {
    const { room, username } = socket.handshake.query;
    if (!room || !username) {
      return false;
    }
    // check if room exists
    if(!io.sockets.adapter.rooms[room]) {
      socket.username = username;
      socket.join(room);
      return true;     
    }

    // check if user is taken
    const sockets = getSocketsInRoom(room);
    for (let socketId in sockets) {
      if (io.sockets.connected[socketId].username === username)
        return false;
    }
    socket.username = username;
    socket.join(room);
    return true;
  }

  function getSocketFromUsernameInRoom(room, username) {
    const sockets = getSocketsInRoom(room);
    for (let socketId in sockets) {
      if (io.sockets.connected[socketId].username === username)
        return socketId;
    }
  }

  /**
   * Socket joins a chat room. If room doesn't exist, creates it.
   * @param {string} room - room to join
   * @returns {Promise} Resolves in a success
   */
  function joinRoom(socket, room) {
    //join the room
    socket.join(room);

    //create a user in the db for the room if it doesnt exist
    return createUser(socket.username, room)
      .then(user => {
        //user has been found or created
        socket.userId = user._id;

        //create the room in the database if it exists
        Room.findOne({ name: room }).exec()
        .then(roomId => {
          // A room has been found
          if (roomId)
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
        });
      })
      .catch(err => Promise.reject(err));
  }

  /**
   * Finds a user in the database. Creates a user if it doesn't exist
   * @param {string} username 
   * @param {string} room 
   * @returns {Promise} Resolves into a user object
   */
  function createUser(username, room) {
    return User.findOne({ name: username, room }).exec()
      .then(user => {
        if (user)
          return Promise.resolve(user);
        else {
          let newUser = new User({
            name: username,
            room: room,
            messages: [],
          });
          return newUser.save()
        }
      })
      .catch(err => Promise.reject(err));
  }
  
  /**
   * 
   * @param {*} message String associated with the text
   * @param {*} user Name of user who creates message
   * @param {*} date Timestamp on the msesage
   * @param {*} room Room name to submit message to
   */
  function createMessage(message, user, date, room) {
    const roomPromise = Room.findOne({ name: room });
    const userPromise = User.findOne({ name: user, room: room });
    return Promise.all([roomPromise, userPromise])
      .then(values => {
        const roomId = values[0];
        const userId = values[1];
        const newMessage = new Message({
          user: userId,
          message,
          date,
          rating: 0,
          room: roomId,
        });
        return newMessage.save(); 
      });
  }

  function disconnectSocket(socket, reason) {
    io.to(socket.id).emit('disconnectReason', reason);    
    setTimeout(() => {
      socket.disconnect('true');
    }, 2000);
  }

  io.on('connection', socket => {
    const { username, room } = socket.handshake.query;    
 
    if (!initializeSocket(socket)) {
      socket.emit('auth', { success: false, reason: 'Username already taken' });      
      disconnectSocket(socket, 'Username already taken');
      return;
    }
    socket.emit('auth', { success: true });
    
    // Join room, initialize socket handlers
    joinRoom(socket, room)
      .then(() => {
        socket.on('send message', data => {
          const { message, delay } = data;

          createMessage(message, socket.username, new Date(Date.now() - 1000 * delay), room)
            .then(createdMessage => {
              io.to(room).emit('sent message', {
                message: createdMessage.message,
                date: createdMessage.date,
                rating: createdMessage.rating,
                room: createdMessage.room.name,
                user: createdMessage.user.name,
                id: createdMessage._id,
              });
              return createdMessage;
            })
            .then(createdMessage => {
              return User.findOne({ name: createdMessage.user.name, room })
                .then(user => {
                  user.messages.push(createdMessage._id);       
                  return user.save();           
                })
            })
            .catch(err => console.log(err));
        });

        socket.on('rate message', data => {
          const roomsTest = io.sockets.adapter.rooms;
          const { id, rating } = data;

          let prevXP, prevLvl;

          Message.findById(data.id).populate('user')
            .then(message => {
              // check if rating comes from same user              
              if (socket.username === message.user.name)
                return Promise.reject('User cannot rate own message');

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
              const socket = getSocketFromUsernameInRoom(room, user.name);
              io.to(socket).emit('changed level', { level: user.level });
            })
            .catch(err => {
              console.log(err);
              //We can reply back to the socket for errors
            });
        });

      })
      .catch(err => {
        disconnectSocket(socket, err);
      });
  });
};
