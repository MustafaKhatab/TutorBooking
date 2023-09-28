const mongoose = require('mongoose')

const tutorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    subjects:[{
        type: String,
        required: true,

    }],
    availability:[{
        day:{
            type:String,
            required: true,
        },
        timeslots:[{
            start:{
                type:String,
                required: true,
            },
            end:{
                type:String,
                required: true,
            }
        }]
    }]
}) 

module.exports = mongoose.model('Tutor', tutorSchema)