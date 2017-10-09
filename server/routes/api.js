const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const User = mongoose.model('User');
const Room = mongoose.model('Room');
const Message = mongoose.model('Message');

const { io } = require('../server');
const { createChatRoom } = require('../sockets');

router.post('/rooms', (req, res) => {
  let type;  
  const name = req.body.room;
  // check if namespace exists. Query the DB for room
  Room.findOne({ name }).exec()
    .then(room => {
      // A room has been found
      if (room)
        type = 'foundRoom';
      // If room hasn't been found create a new one
      else {
        let newRoom = new Room({
          name,
          users: [],
          messages: [],
        })
        newRoom.save()
          .then(room => {
            room.save();
            type = 'createRoom';
            createChatRoom(io, name);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
    })
    .then(() => {
      return res.status(200).json({
        success: true,
        type,
      })
    })
    .catch(err => {
      return res.status(400).json({
        success: false,
        errors: err,
      })
    })
});

router.post('/rooms/signin', (req, res) => {
  const { room, username } = req.body;
  // verify that username is currently not being used.
  /*
    A couples ways to do it. Requirement: only one user connected at a time:
      - cookies
        - check database on whether user is logged in
      - emit and recieve response via sockets
  */
  let message;
  if (req.session.page_views){
    req.session.page_views++;
    message = "You visited this page " + req.session.page_views + " times";
  } else {
    req.session.page_views = 1;
    message = "Welcome to this page for the first time!";
  }
  return res.status(200).json({
    message,
  })
});

module.exports = router;