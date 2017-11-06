const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const User = mongoose.model('User');
const Room = mongoose.model('Room');
const Message = mongoose.model('Message');

const { io } = require('../server');
const { createChatRoom } = require('../sockets');

router.get('/rooms/:room', (req, res) => {
  const { room } = req.params;
  
  Room.findOne({ name: room }).exec()
    .then(roomDb => {
      if (roomDb) {
        // Room has already been created        
        return {
          room: true,
          settings: {
            timeout: roomDb.timeout,
            password: roomDb.password
          }
        }
      } else {
        // Room doesn't yet exist
        return {
          room: false,
        }
      }
    })
    .then(r => {
      return res.status(200).json(r);
    })
})

router.post('/rooms', (req, res) => {
  const { room, rating, leaderboard, timeout, password } = req.body;
  Room.findOne({ name: Room }).exec()
    .then(roomDb => {      
      if (roomDb) {
        return res.status(400).json({
          success: false,
        })
      }
      let hashedPassword;
      if (password) {
        hashedPassword = new Promise((resolve, reject) => {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err)
              reject(err);
            resolve(hash);
          });
        });
      } else {
        hashedPassword = Promise.resolve(null);
      }
      return hashedPassword
    })
    .then(hashedPassword => {      
      // Room doesn't exist, create it
      const newRoom = new Room({
        name: room,
        users: [],
        messages: [],
        rating,
        leaderboard,
        timeout,
        password: hashedPassword
      });
      return newRoom.save()
    })
    .then(newRoom => {
      return res.status(200).json({
        success: true,
      });
    });
})

module.exports = router;