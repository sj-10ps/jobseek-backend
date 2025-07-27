const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    skill: String,
    level:String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

module.exports = mongoose.model('skill', skillSchema);
