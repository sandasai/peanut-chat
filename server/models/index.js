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
  ratedBy: {
    type: Schema.Types.Mixed, default: {}
  },
  room: {
    type: Schema.Types.ObjectId, ref: 'Room'    
  }
});

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
  ],
  xp: {
    type: Number, default: 0,
  },
  level: {
    type: Number, default: 0,
  },
  startLevelXp: {
    type: Number, default: 0,
  },
  nextLevelXp: {
    type: Number, default: 1,
  }
});

// Updates the level if needed
UserSchema.methods.updateLevel = function() {
  function calcXpAtStartLevel(level) {
    if (level === 0) {
      return 0;
    }
    return level + calcXpAtStartLevel(level - 1);
  }

  function calcExpectedLevel(xp) {
    function helper(start, xp, level) {
      if (start + level - 1 >= xp)
        return level - 1;
      return helper(start + level, xp, level + 1);
    }
    return helper(0, xp, 1);
  }
  this.level = calcExpectedLevel(this.xp);
  this.startLevelXp = calcXpAtStartLevel(this.level);
  this.nextLevelXp = this.startLevelXp + this.level + 1;
  return this.save();
}

// Updates XP on the model
UserSchema.methods.updateXP = function() {
  this.xp = this.messages.reduce((sum, message) => {
    return sum + message.rating;
  }, 0);
  return this.save();
}

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

  
