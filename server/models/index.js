const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//use the Promise library
mongoose.Promise = Promise;

const RoomSchema = Schema({
  name: {
    type: String,
    required: true,
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
  ],
  rating: {
    type: Boolean,
    default: true,
  },
  leaderboard: {
    type: Boolean,
    default: true,
  },
  delay: {
    type: Boolean,
    default: true,
  },
  timeout: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    default: null
  }
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
  },
  lastMessageSendDate: {
    type: Date, default: new Date(0)
  },
  timeout: {
    type: Number, default: 45000
  },
  lastRatingDate: {
    type: Date, default: new Date(0)
  },
  ratingTimeout: {
    type: Number, default: 45000
  }
});

// Updates the level if needed
UserSchema.methods.updateLevel = function() {
  // XP per level is simply the number of the next level.
  // i.e if on level 5, 6 xp needed to move to level 6
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

  
