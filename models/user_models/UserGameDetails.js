const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const achievementsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {  
        type: String,
    },
    dateAchieved: {
        type: Date,
        default: Date.now
    },
    exp_gained: {
        type: Number
    }
});

const acceptedInvitesSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    friendMessage: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    time: {
        type: String,
    }
});

const UserGameDetailsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    achievements: [achievementsSchema],
    level: {
        type: Number,
        default: 1
    },
    exp_points: {
        type: Number
    },
    highestStreak: {
        type: Number
    },
    currentStreak: {
        type: Number
    },
    acceptedInvites: [ acceptedInvitesSchema ]
});

module.exports = mongoose.model('UserGameDetails', UserGameDetailsSchema);