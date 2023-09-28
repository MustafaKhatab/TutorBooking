const Favorites = require("../models/Favorites");
const User = require("../models/User");
const Tutor = require("../models/Tutor");
const { getChatGptResponse } = require("../chatGPT");
const asyncHandler = require("express-async-handler");

const getScores = asyncHandler(async (req, res) => {
  const { userId, messages } = req.body;
  messages.push({
    role: "user",
    content:
      "list the names of the best-fit tutors exactly as given in the list from the system message starting with the tutor the student confirmed booking then the other fit tutors along with their corresponding scores in this format: name,score;name,score;name,score. Your response should only include this information, if the student didnt confirm any booking reply with a No.",
  });
  console.log(messages)
  try {
    const chatGptResponse = await getChatGptResponse(messages);
    console.log(chatGptResponse,"res");
    const tutors = chatGptResponse.content.split(";");
    console.log(tutors,"tutosr")

    for (const tutor of tutors) {
      const tutorName = tutor.split(",")[0];
      const fitScore = tutor.split(",")[1];
      console.log(tutorName)
      const userExists = await User.findById(userId).lean().exec();
      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }
      const tutorExists = await Tutor.findOne({ username: tutorName })
        .lean()
        .exec();
      if (!tutorExists) {
        console.log(tutorName)
        return res.status(404).json({ message: "Tutor not found" });
      }

      // Create a new chat
      const newFavorites = new Favorites({
        user: userId,
        tutor: tutorExists._id,
        fitScore: fitScore,
      });

      // Save the new chat
      const savedFavorites = await newFavorites.save();
      if (savedFavorites) {
        //created
        res.status(201).json(savedFavorites);
      } else {
        res.status(400).json({ message: "Invalid favorites data received" });
      }
    }
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Failed to retrieve ChatGPT response" ,error});
  }
});

module.exports = {
  getScores,
};
