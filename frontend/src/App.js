// src/App.js

import React, { useState, useEffect, useRef } from "react";
import Chatbot from "./chatbot";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import AskRae from "./components/AskRae";
import SavedPapers from "./components/SavedPapers";
import Feedback from "./components/Feedback";
import AboutUs from "./components/AboutUs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCog, 
  faComments,
  faBars,
  faBook,
  faRobot,
  faFile,
  faComment,
  faInfoCircle,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import "./App.css";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [showRightSidebar, setShowRightSidebar] = useState(!isMobile);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Ask RAE');
  
  // Shared state for communication between components
  const [chatHistory, setChatHistory] = useState([]);
  const chatbotRef = useRef(null);
  
  const menuItems = [
    { icon: faBook, text: 'Ask RAE', active: activeMenuItem === 'Ask RAE' },
    { icon: faRobot, text: 'Virtual Assistant', active: activeMenuItem === 'Virtual Assistant' },
    { icon: faFile, text: 'Saved Papers', active: activeMenuItem === 'Saved Papers' },
    { icon: faComment, text: 'Feedback', active: activeMenuItem === 'Feedback' },
    { icon: faInfoCircle, text: 'About Us', active: activeMenuItem === 'About Us' },
    { icon: faSignOutAlt, text: 'Sign Out', active: activeMenuItem === 'Sign Out' }
  ];

  const handleMenuClick = (text) => {
    setActiveMenuItem(text);
    if (isMobile) {
      setShowLeftSidebar(false);
    }
  };

  // Function to render the active component
  const renderActiveComponent = () => {
    switch (activeMenuItem) {
      case 'Ask RAE':
        return <AskRae />;
      case 'Virtual Assistant':
        return (
          <Chatbot 
            ref={chatbotRef} 
            updateChatHistory={updateChatHistory}
          />
        );
      case 'Saved Papers':
        return <SavedPapers />;
      case 'Feedback':
        return <Feedback />;
      case 'About Us':
        return <AboutUs />;
      case 'Sign Out':
        // Handle sign out logic here
        return null;
      default:
        return <AskRae />;
    }
  };

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
        setShowRightSidebar(true);
        setShowLeftSidebar(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-layout">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          {isMobile && (
            <button 
              className="nav-button"
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              title="Toggle Menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
          <h1>RAE</h1>
        </div>
        <div className="navbar-actions">
          {activeMenuItem === 'Virtual Assistant' && (
            <button 
              className="nav-button" 
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              title="Toggle Chat History"
            >
              <FontAwesomeIcon icon={faComments} />
            </button>
          )}
          <button 
            className="nav-button"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
          <button 
            className="nav-button"
            title="Profile"
          >
            <FontAwesomeIcon icon={faUser} />
          </button>
        </div>
      </nav>

      {/* Left Sidebar */}
      <div className={`sidebar-left ${showLeftSidebar ? 'show' : ''}`}>
        <div className="menu-items">
          {menuItems.map((item, index) => (
            <button 
              key={index} 
              className={`menu-item ${item.active ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.text)}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`main-chat ${showRightSidebar && activeMenuItem === 'Virtual Assistant' ? 'with-right-sidebar' : ''}`}>
        {renderActiveComponent()}
        
        {showRightSidebar && activeMenuItem === 'Virtual Assistant' && (
          <div className="sidebar-right">
            <LeftSidebar 
              chatHistory={chatHistory}
              onLoadConversation={handleLoadConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
        )}
        
        {showHelpPanel && (
          <div className={`help-panel ${showHelpPanel ? 'show' : ''}`}>
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
