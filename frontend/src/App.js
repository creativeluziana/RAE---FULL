// src/App.js

import React, { useState, useEffect, useRef } from "react";
import Chatbot from "./chatbot";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import "./App.css";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [showLeftSidebar, setShowLeftSidebar] = useState(!isMobile);
  const [showRightSidebar, setShowRightSidebar] = useState(!isMobile);
  
  // Shared state for communication between components
  const [chatHistory, setChatHistory] = useState([]);
  const chatbotRef = useRef(null);
  
  // Function to load conversation in chatbot
  const handleLoadConversation = (conversation) => {
    if (chatbotRef.current && chatbotRef.current.handleLoadConversation) {
      chatbotRef.current.handleLoadConversation(conversation);
    }
  };
  
  // Function to delete conversation
  const handleDeleteConversation = (id) => {
    if (chatbotRef.current && chatbotRef.current.handleDeleteConversation) {
      chatbotRef.current.handleDeleteConversation(id);
    }
  };
  
  // Function to update chat history from Chatbot component
  const updateChatHistory = (history) => {
    setChatHistory(history);
  };
  
  // Check screen size on resize
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 992;
      setIsMobile(mobileView);
      if (!mobileView) {
        setShowLeftSidebar(true);
        setShowRightSidebar(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-layout">
      {isMobile && (
        <div className="mobile-toggles">
          <button onClick={() => setShowLeftSidebar(!showLeftSidebar)}>
            {showLeftSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
          <button onClick={() => setShowRightSidebar(!showRightSidebar)}>
            {showRightSidebar ? 'Hide Context' : 'Show Context'}
          </button>
        </div>
      )}
      
      <div className="app-container">
        {showLeftSidebar && (
          <div className="sidebar-left">
            <LeftSidebar 
              chatHistory={chatHistory}
              onLoadConversation={handleLoadConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
        )}
        
        <div className="main-chat">
          <Chatbot 
            ref={chatbotRef} 
            updateChatHistory={updateChatHistory}
          />
          <footer className="app-footer">
            <p>RAE Assistant &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>
        
        {showRightSidebar && (
          <div className="sidebar-right">
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
