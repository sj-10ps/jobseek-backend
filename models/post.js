const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    media: String,
    description:String,
    likes: {
        type:Number,
        default:0
    },
    likedby:[String],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const post=mongoose.model('Post', postSchema);
module.exports = post
