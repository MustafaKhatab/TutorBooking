import { useState, useEffect } from "react";
import {
  useGetChatsQuery,
  useAddNewMessageMutation,
  useAddNewChatMutation,
  useAddNewChatMessageMutation,
  useAddNewBookingMutation
} from "./chatsApiSlice";
import useAuth from "../../hooks/useAuth";
import useTitle from "../../hooks/useTitle";
import { useNavigate } from "react-router-dom";
import { useSendLogoutMutation } from "../auth/authApiSlice";
import PulseLoader from 'react-spinners/PulseLoader'


const Chat = () => {
  useTitle("New Chat");
  const [value, setValue] = useState("");
  const [newChatExists, setNewChatExists] = useState(false);
  const navigate = useNavigate();
  const [currentChat, setCurrentChat] = useState(null);
  const { userId } = useAuth();
  const { data: chatData, isLoading, isError } = useGetChatsQuery(userId);
  const [addNewChat,{isLoading:isLoadingNewChat,error:errorChat}] = useAddNewChatMutation();
  const [addNewMessage,{isLoading:isLoadingMessages,error:errorMessage}] = useAddNewMessageMutation();
  const [addNewChatMessage,{isLoading:isLoadingNewChatM,error:errorChatM}] = useAddNewChatMessageMutation();
  const [AddNewBooking,{isLoading:isLoadingNewBooking}] = useAddNewBookingMutation();
  const [sendLogout, { isLoading: isLoggingOut }] = useSendLogoutMutation();
  const reversedChatHistory = chatData ? Object.values(chatData.entities) : [];
  const chatHistory = reversedChatHistory.reverse();

  useEffect(() => {
    document.title = currentChat?.title || "New Chat";
  }, [currentChat]);


  const createNewChat = async () => {
    if(!newChatExists){
    setValue("");
    const newChatData = await addNewChat({ userId: userId });
    setCurrentChat(newChatData.data);
    setNewChatExists(true);
    }
    else{
    const newChat = chatHistory.find(chat => chat.messages.length === 0);
    if (newChat) {
      setCurrentChat(newChat);
    }
    }
  };

  const changeChat = (selectedChat) => {
    setCurrentChat(selectedChat);
    setValue("");
  };
  useEffect(() => {
    const newChat = chatHistory.find(chat => chat.messages.length === 0);
    if (newChat) {
      setNewChatExists(true);
    }
    else{
      setNewChatExists(false);
    }
    
  }, [chatHistory]);

  const getMessages = async () => {
    const message = { role: "user", content: value };
    setValue("");
    if (!currentChat) {
      if(newChatExists){
        const newChat = chatHistory.find(chat => chat.messages.length === 0);
        const { data: current}=await addNewMessage({ chatId: newChat._id, message })
        setCurrentChat(current);
        setNewChatExists(false);
      }
      else{
        const { data: current}=await addNewChatMessage({
          userId: userId,
          role: "user",
          content: value,
        })
        
        setCurrentChat(current);
      }
      
    } else {
      const { data: current}=await addNewMessage({ chatId: currentChat._id, message })
      setCurrentChat(current);
    }
    
  };

  const handleLogout = () => {
    sendLogout();
    navigate("/");
  };

  

  const renderedChatHistory = chatHistory.map((chat) => (
    <li
      key={chat.id}
      onClick={() => changeChat(chat)}
      className={currentChat === chat ? "active" : ""}
    >
      {chat.title}
    </li>
  ));
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getMessages();
    }
  };
  
  const handleBooking = async () => {
    if (currentChat?.messages && currentChat.messages.length >= 2) {
      const booking= await AddNewBooking({messages:currentChat.messages,userId:userId});
    } else {
      //error to user{please decide which tutor to book first}
    }
  };
  
  

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New Chat</button>
        {isLoadingNewChat && !errorChat && <PulseLoader className="custom-loader" size={5} margin={5} color={'#FFF'}></PulseLoader>}
        <ul className="history">{renderedChatHistory}</ul>
        <nav>
          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            Logout
          </button>
          <button
            className="navigate-button"
            onClick={handleBooking}
            disabled={isLoggingOut}
          >
            Book
          </button>
        </nav>
      </section>

      <section className="main">
        {!currentChat && <h1 className="title">Tutor Booking</h1>}
        {isError ? (
          <div className="error">Error loading chats</div>
        ) : isLoading ? (
          <div className="loading">Loading chats...</div>
        ) : (
          <ul className="feed">
          {currentChat?.messages?.filter((message) => message.role !== "system").map((message, index) => (
            <li key={index}>
              <div
                className={`message-container ${
                  message.role === "user" ? "user-message" : "assistant-message"
                }`}
              >
                {message.role === "user" ? (
                  <img
                    className="role-icon-user"
                    src={require("../../img/user.png")}
                    alt="User"
                  />
                ) : (
                  <img
                    className="role-icon-assistant"
                    src={require("../../img/ChatGPTLogo.png")}
                    alt="Assitant"
                  />
                )}
                <p className="chatContent">{message.content}</p>
              </div>
            </li>

          ))}
          {errorMessage && <div className="error">{errorMessage.data.message}</div>}
          {isLoadingMessages && !errorMessage && <PulseLoader className="custom-loader" size={13} margin={20} color={'#FFF'}></PulseLoader>}
          {errorChatM && <div className="error">{errorChatM.data.message}</div>}
          {isLoadingNewChatM && !errorChatM && <PulseLoader className="custom-loader" size={13} margin={20} color={'#FFF'}></PulseLoader>}
          {errorChat && <div className="error">{errorChat.data.message}</div>}
        </ul>)}
        <div className="bottom-section">
          <div className="input-container">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send a message..."
            />
            <div id="submit" onClick={getMessages}>
              ➢
            </div>
          </div>
          <p className="info">
            Powered by Chat GPT May 20 Version, a Free Research Preview.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Chat;
