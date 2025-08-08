const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: String,
    jobtype: String,
    description: String,
    skills: [String],
    responsibilities: String,
    salaryrange:String,
    experience: String,
    status: String,
    applicantscount: {
        type:Number,
        default:0
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }
})

module.exports = mongoose.model('job', jobSchema);
