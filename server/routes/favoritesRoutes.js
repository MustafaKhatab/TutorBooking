const express = require('express')
const router = express.Router()
const favoritesController = require('../controllers/favoritesController')
const verifyJWT = require('../middleware/verifyJWT')
//router.use(verifyJWT)

router.route('/')
    .post(favoritesController.getScores)

module.exports = router