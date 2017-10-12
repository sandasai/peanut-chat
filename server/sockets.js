const mongoose = require('mongoose');

const User = mongoose.model('User');
const Room = mongoose.model('Room');
const Message = mongoose.model('Message');

module.exports = function(io) {
  /**
   * Returns the socket ids of all sockets in room
   * @param {string} room room to check
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
      return true      
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
    return User.findOne({ name: username }).exec()
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
  
  function createMessage(message, user, date, room) {
    const roomPromise = Room.findOne({ name: room }).exec();
    const userPromise = User.findOne({ name: user }).exec();
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
    console.log(`Disconnected ${socket.handshake.query.username}; reason: ${reason}`)
  }

  io.on('connection', socket => {
    const { username, room } = socket.handshake.query;    
    console.log("New client " + username + " connected to " + room);
 
    if (!initializeSocket(socket)) {
      socket.emit('auth', { success: false, reason: 'Username already taken' });      
      disconnectSocket(socket, 'Username already taken');
      return;
    }
    socket.emit('auth', { success: true });
    
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
              return User.findOne({ name: createdMessage.user.name }).exec()
                .then(user => {
                  user.messages.push(createdMessage._id);
                  return user.save();
                })
                .then(() => createdMessage)
            })
            .catch(err => console.log(err));
        });

        socket.on('rate message', data => {
          const { id, rating } = data;

          Message.findById(data.id).populate('user', 'name')
            .then(message => {

              // check if rating comes from same user              
              if (socket.username === message.user.name)
                return;

              // check if user has already rated this
              if (message.ratedBy[socket.userId])
                return;
              message.ratedBy[socket.userId] = true;              

              if (rating === 'up')
                message.rating = message.rating + 1;
              else if (rating === 'down')
                message.rating = message.rating - 1;
              else {
                return;                
              }

              //check if user needs to level up
              User.findById(message.user._id)
                .then(user => {
                  return user.updateXP();
                })
                .then(user => {
                  return user.updateLevel();
                })
                .then(() => {
                  return message.save()
                  .then(ratedMessage => {
                    io.to(room).emit('rated message', {
                      id: ratedMessage._id,
                      rating: ratedMessage.rating,
                    });
                  });
                })
            })
            .catch(err => console.log(err));
        });

      })
      .catch(err => {
        disconnectSocket(socket, err);
      });

    socket.on('disconnect', () => {
      console.log(`${socket.username} disconnected from ${room}`);
    });

  });
}