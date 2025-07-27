const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    templateType: String, // 'system' or 'custom'
   
    
    generatedPdf: String, // file path of generated resume pdf
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('resume', resumeSchema);
