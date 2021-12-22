require('../db/mongoose')
const mongoose =require('mongoose')
const taskschema=new mongoose.Schema({description: {
    type: String,
    required: true,
    trim: true
},
Date: {
    type: Date
    },

schedule: {
    hours: {
        type: Number, required: true, min: 0, max: 23
    },
    minutes: {
        type: Number, required: true, min: 0, max: 59
    }
},
completed: {
    type: Boolean,
    default: false
},
job_files:[{job_file:{type:Buffer}}],
owner: {
    type: mongoose.Schema.Types.ObjectId,//object id
    required: true,
    ref: 'User'//mandtry to run populatecommand
}
},{timestamps:true})
const Task = mongoose.model('Task', taskschema)

module.exports = Task