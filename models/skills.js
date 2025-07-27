const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    skill: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

module.exports = mongoose.model('skill', skillSchema);
