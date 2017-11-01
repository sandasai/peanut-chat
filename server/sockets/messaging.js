const mongoose = require('mongoose');
const User = mongoose.model('User');
const Room = mongoose.model('Room');
const Message = mongoose.model('Message');

function sendMessage (io, socket, room, data) {
  const { message, delay } = data;
  
  return new Promise((resolve, reject) => {
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
      })
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
  })
}

module.exports = {
  name: 'messaging',
  on: {
    'send message': sendMessage
  }
}