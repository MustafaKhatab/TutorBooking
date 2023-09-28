const express = require('express')
const router = express.Router()
const tutorController = require('../controllers/tutorsController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/').post(tutorController.createNewTutor)
//router.use(verifyJWT)
router.route('/')
    .get(tutorController.getAllTutors)
    .patch(tutorController.updateTutor)
    .delete(tutorController.deleteTutor)

module.exports = router
