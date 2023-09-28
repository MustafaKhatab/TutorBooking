const Chat = require("../models/Chat");
const Tutor = require('../models/Tutor');
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const { getChatGptResponse } = require("../chatGPT");

const handleUserMessage = asyncHandler(async (req, res) => {
  //get new user message from the body
  message = req.body;
  //check if the chat exists
  const chatId = req.params.chatId;
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  if(chat.messages.length==0){
    const tutors = await Tutor.find().select('-password').lean();
    const tutorList = tutors.map((tutor) => {
      const subjects = tutor.subjects.join(', '); // Join subjects array into a string
      const availability = tutor.availability.map((slot) => {
        // Format each availability slot
        const timeslots = slot.timeslots.map((timeslot) => `${timeslot.start}-${timeslot.end}`).join(', ');
        return `${slot.day}: ${timeslots}`;
      }).join(', ');
    
      return `- ${tutor.username}, teaches ${subjects}, availability: ${availability}`;
    }).join('\n');
    chat.messages.push({
      "role": "system",
      "content": "You are the intelligent matchmaking assistant for a private tutoring marketplace. Your role is to assist students in finding the right tutor based on their preferences. You will receive the student's desire for the tutor availability and subject and also a list of tutors, including the subjects they teach and their available time slots. Your task is as follow 1) evaluate the tutors based on the student's preferences and provide the student with a list of suitable tutors who match both the subject and availability this list should include the tutor's name and their time availability.2) Assign a score to each tutor, ranging from 0.00 (no fit) to 1.00 (perfect fit), based on how well they match the student's request. If there are three or more tutors, provide scores for the top 3 best-fit tutors; otherwise, rate the available tutors. 3)Ask the student if they want to confirm booking with the best-fit tutor. 4) If they wish to proceed with the booking, ask the student to confirm by pressing the book button on the bottom left and end the conversation there. Here is the list of available tutors:"+tutorList})
  }
  chat.messages.push(message);
  const prompt = chat.messages;

  // Send user message to ChatGPT API
  try{

  
  const chatGptResponse = await getChatGptResponse(prompt);
  
  // Prepare the chatbot response object
  const botResponse = {
    role: "assistant",
    content: chatGptResponse.content,
  };

  // Add the chatbot response to the chat messages
  // and save the updated chat document

  chat.messages.push(botResponse);
  if (chat.title === "New Chat") {
    if (message.content.length > 20) {
      chat.title = message.content.slice(0, 20) + "...";
    } else {
      chat.title = message.content;
    }
  }
  await chat.save();

  // Return the chatbot response to the client
  res.json(chat);
}
catch(error){
  return res.status(500).json({ message: "Failed to retrieve ChatGPT response" });

}

});

const handleUserMessageAndCreation = asyncHandler(async (req, res) => {
  const message = req.body;
  const tutors = await Tutor.find().select('-password').lean();
  const tutorList = tutors.map((tutor) => {
    const subjects = tutor.subjects.join(', '); // Join subjects array into a string
    const availability = tutor.availability.map((slot) => {
      // Format each availability slot
      const timeslots = slot.timeslots.map((timeslot) => `${timeslot.start}-${timeslot.end}`).join(', ');
      return `${slot.day}: ${timeslots}`;
    }).join(', ');
  
    return `- ${tutor.username}, teaches ${subjects}, availability: ${availability}`;
  }).join('\n');
  // Create the system message with the list of tutors
  const systemMessage = {
    role: "system",
    content: `You are the intelligent matchmaking assistant for a private tutoring marketplace. Your role is to assist students in finding the right tutor based on their preferences. You will receive the student's desire for the tutor availability and subject and also a list of tutors, including the subjects they teach and their available time slots. Your task is as follow 1) evaluate the tutors based on the student's preferences and provide the student with a list of suitable tutors who match both the subject and availability this list should include the tutor's name and their time availability.2) Assign a score to each tutor, ranging from 0.00 (no fit) to 1.00 (perfect fit), based on how well they match the student's request. If there are three or more tutors, provide scores for the top 3 best-fit tutors; otherwise, rate the available tutors. 3)Ask the student if they want to confirm booking with the best-fit tutor. 4) If they wish to proceed with the booking, ask the student to confirm by pressing the book button on the bottom left and end the conversation there. Here is the list of available tutors:\n${tutorList}`,
  }
  const userExists = await User.findById(message.userId).lean().exec();
  if (!userExists) {
    return res.status(404).json({ message: "User not found" });
  }

  try{
  // Send user message to ChatGPT API
  const prompt=[systemMessage, { role: "user", content: message.content }]
  const chatGptResponse = await getChatGptResponse(prompt);
  // Prepare the chatbot response object
  const botResponse = {
    role: "assistant",
    content: chatGptResponse.content,
  };

  // Create a new chat
  const messages = [...prompt, botResponse];
  const newChat = new Chat({
    user: message.userId,
    title: message.content,
    messages: messages,
  });

  // Save the new chat
  const savedChat = await newChat.save();
  if (savedChat) {
    //created
    res.status(201).json(savedChat);
  } else {
    res.status(400).json({ message: "Invalid chat data received" });
  }
}catch(error){
  return res.status(500).json({ message: "Failed to retrieve ChatGPT response",error });

}
});

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find().lean();

  // If no chats
  if (!chats?.length) {
    return res.status(400).json({ message: "No chats found" });
  }

  // Add username to each chat before sending the response
  const chatsWithUser = await Promise.all(
    chats.map(async (chat) => {
      const user = await User.findById(chat.user).lean().exec();
      return { ...chat, username: user.username };
    })
  );

  res.json(chatsWithUser);
});

const getUserChats = asyncHandler(async (req, res) => {
  // Get the userId from the request body
  const userId = req.params.userId;
  // Find the user based on the userId
  const user = await User.findOne({ _id: userId }).lean().exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Find the chats for the user
  const chats = await Chat.find({ user: user._id }).lean();

  // If no chats found for the user
  if (!chats.length) {
    return res.status(400).json({ message: "No chats found for the user" });
  }

  res.json(chats);
});

// @desc Create new chat
// @route POST /chats
// @access Private
const createNewChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  // Check if the user exists
  const userExists = await User.findById(userId).lean().exec();
  if (!userExists) {
    return res.status(404).json({ message: "User not found" });
  }

  // Create a new chat
  const newChat = new Chat({
    user: userId,
    title: "New Chat",
    messages: [],
  });

  // Save the new chat
  const savedChat = await newChat.save();
  if (savedChat) {
    //created
    res.status(201).json(savedChat);
  } else {
    res.status(400).json({ message: "Invalid chat data received" });
  }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateChat = asyncHandler(async (req, res) => {
  const { id, title, messages } = req.body;
  if (!id) {
    return res.status(400).json({ message: "id required" });
  }
  // Check if the chat exists
  const chat = await Chat.findById(id);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // Update the chat properties
  chat.title = title || chat.title;
  chat.messages = messages || chat.messages;

  // Save the updated chat
  const updatedChat = await chat.save();

  res.json({ chat: updatedChat });
});

const deleteChat = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Check if the chat exists
  const chat = await Chat.findById(id);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // Delete the chat
  const result = await chat.deleteOne();

  const reply = `chat with ID ${result._id} from UserID${result.user} deleted`;

  res.json(reply);
});

module.exports = {
  handleUserMessage,
  handleUserMessageAndCreation,
  getAllChats,
  getUserChats,
  createNewChat,
  updateChat,
  deleteChat,
};
