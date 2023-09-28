const Tutor = require('../models/Tutor')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

const getAllTutors = asyncHandler(async (req, res) => {
    const tutors = await Tutor.find().select('-password').lean()

    if (!tutors?.length) {
        return res.status(400).json({ message: 'No tutors found' })
    }

    res.json(tutors)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewTutor = asyncHandler(async (req, res) => {
    const { username, password, email,subjects, availability  } = req.body

    // Confirm data
    if (!username || !password  || !email || !subjects || !availability) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicateTutor = await Tutor.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicateTutor) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

     // Check for duplicate email
    const duplicateEmail =  await Tutor.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicateEmail) {
        return res.status(409).json({ message: 'Duplicate email' })
    }
     // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }


    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = { username, "password": hashedPwd, email,subjects,availability }

    // Create and store new user 
    const tutor = await Tutor.create(userObject)

    if (tutor) { //created 
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
})

// @desc Update a user
// @route PATCH /users
// @access Private
const updateTutor = asyncHandler(async (req, res) => {
    const { id, username, password,email,subjects,availability } = req.body

    // Confirm data 
    if (!id || !username || !email || !subjects ||!availability) {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const tutor = await Tutor.findById(id).exec()

    if (!tutor) {
        return res.status(400).json({ message: 'Tutor not found' })
    }

    // Check for duplicate 
    const duplicate =  await Tutor.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    tutor.username = username
    tutor.email = email
    tutor.subjects=subjects
    tutor.availability=availability

    if (password) {
        // Hash password 
        tutor.password = await bcrypt.hash(password, 10) // salt rounds 
    }
    

    const updatedTutor = await tutor.save()

    res.json({ message: `${updatedTutor.username} updated` })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteTutor = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Tutor ID Required' })
    }

    // Delete the user chats

    // Does the user exist to delete?
    const tutor = await Tutor.findById(id).exec()

    if (!tutor) {
        return res.status(400).json({ message: 'Tutor not found' })
    }

    const result = await tutor.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllTutors,
    createNewTutor,
    updateTutor,
    deleteTutor
}