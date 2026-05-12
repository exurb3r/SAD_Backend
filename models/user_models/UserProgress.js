const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const distributionSchema = new Schema({
    workoutType: {
        type: String    //example: cardio, 
    },
    numberofWorkouts: {
        type: Number  //sets  specifically for arms, legs, core etc.
    },
    timeSpent: {
        type: Number  //in hours and this is specifically for Jogging and Threadmills
    }
},  { _id: false });

const progressSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    hoursSpent: {
        type: Number
    },
    totalWorkouts: {
        type: Number
    },
    totalExpGained:{
        type: Number
    },
    distribution: [ distributionSchema ]
},  { _id: false })

const userProgressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    progress: [progressSchema]
});

module.exports = mongoose.model('UserProgress', userProgressSchema);