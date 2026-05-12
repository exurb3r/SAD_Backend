const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSubSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
});

const invitationSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    username: {
        type: String,
    },
    email: {
        type: String,
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


const calendarSchema = new Schema({
    title: {
        type: String, 
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    time: {
        type: String,
    }
})
const userSocialSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    friends:             [friendSubSchema],
    friendRequests:      [friendSubSchema],
    trainerAssigned:     { type: String },
    invitationsSent:     [invitationSchema],
    invitationsReceived: [invitationSchema], 
    calendar:            [calendarSchema]
});
module.exports = mongoose.model('UserSocial', userSocialSchema);