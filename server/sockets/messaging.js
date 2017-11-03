const mongoose = require('mongoose');
const User = mongoose.model('User');
const Room = mongoose.model('Room');
const Message = mongoose.model('Message');

function sendMessage (io, socket, room, data) {
  const { message, delay } = data;
  
    const roomPromise = Room.findOne({ name: room }).exec();
    const userPromise = User.findOne({ name: socket.username, room: room }).exec();
    
    return Promise.all([roomPromise, userPromise])
      .then(values => {
        const roomId = values[0];
        const userId = values[1];
        const newMessage = new Message({
          user: userId,
          message,
          date: new Date(Date.now() - 1000 * delay),
          rating: 0,
          room: roomId,
        });
        return newMessage.save()
      })
      .then(createdMessage => {
        return Message.findById(createdMessage._id)
                .populate('room', 'name')
                .populate('user', 'name')
                .exec()
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
        return User.findOne({ name: createdMessage.user.name, room }).exec()
        .then(user => {
          user.messages.push(createdMessage._id);       
          user.save(() => {
            return Promise.resolve()
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