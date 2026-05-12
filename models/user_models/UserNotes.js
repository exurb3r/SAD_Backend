const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSubSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {  
        type: String,
    }
})

const noteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    notes: [noteSubSchema]
});

module.exports = mongoose.model('Task', noteSchema);