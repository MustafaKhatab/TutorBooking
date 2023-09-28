const mongoose = require('mongoose')

const studentFavoritesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tutor'
    },
    fitScore:{
        type:Number,
        required: true,
    },
  });

module.exports = mongoose.model('studentFavorites', studentFavoritesSchema)