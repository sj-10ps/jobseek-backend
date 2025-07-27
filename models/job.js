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
    applicantscount: Number,
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    }
})

module.exports = mongoose.model('job', jobSchema);
