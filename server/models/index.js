const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//use the Promise library
mongoose.Promise = global.Promise;

const RoomSchema = Schema({
  name: {
    type: String,
  },
  users: [
    {
      type: Schema.Types.ObjectId, ref: 'User'
    }
  ],
  messages: [
    {
      type: Schema.Types.ObjectId, ref: 'Message'
    }
  ]
});

const MessageSchema = Schema({
  user: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  message: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  rating: {
    type: Number,
    default: 0,
  },
  room: {
    type: Schema.Types.ObjectId, ref: 'Room'    
  }
})

const UserSchema = Schema({
  name: {
    type: String,
  },
  room: {
    type: String,
  },
  messages: [
    {
      type: Schema.Types.ObjectId, ref: 'Message'
    }
  ]
})

module.exports.connect = (uri) => {
  //connect to mongoDb  
  mongoose.connect(uri, { useMongoClient: true })
  .then(() => console.log('Successfully connected to MongoDB server'))
  .catch((err) => console.log(err))
  
  //load models
  mongoose.model('Room', RoomSchema);
  mongoose.model('Message', MessageSchema);
  mongoose.model('User', UserSchema);
}

  
