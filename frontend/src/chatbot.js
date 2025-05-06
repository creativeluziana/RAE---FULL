import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import "./App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faMoon, 
  faSun, 
  faMicrophone, 
  faImage, 
  faFileUpload,
  faKeyboard,
  faTrash,
  faStar as fasStar,
  faVolumeUp,
  faVolumeMute,
  faShareAlt,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import ExportOptions from './components/ExportOptions';
import LeftSidebar from './components/LeftSidebar';
import Settings from './components/Settings';

// Hugging Face token for Stable Diffusion 3.5
const HF_API_TOKEN = localStorage.getItem('rae-hf-api-key');

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

const Chatbot = forwardRef(({ updateChatHistory }, ref) => {
  // Load saved theme from localStorage or default to "light"
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("rae-theme");
    return savedTheme || "light";
  });
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("rae-theme", newTheme);
  };

  // Basic chat states
  // Load chat history from localStorage or start empty
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState(() => {
    const savedHistory = localStorage.getItem("rae-chat-history");
    if (savedHistory) {
      try {
        // Convert string date back to Date objects
        const parsedHistory = JSON.parse(savedHistory);
        return parsedHistory.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
      } catch (e) {
        console.error("Error parsing saved chat history:", e);
        return [];
      }
    }
    return [];
  });
  
  const [loading, setLoading] = useState(false);

  // PDF mode
  const [pdfFile, setPdfFile] = useState(null);
  const [isPdfMode, setIsPdfMode] = useState(() => {
    const savedPdfMode = localStorage.getItem("rae-pdf-mode");
    return savedPdfMode === "true";
  });

  // TTS states
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // STT (speech-to-text)
  const [sttActive, setSttActive] = useState(false);

  // Image-generation mode
  const [imageMode, setImageMode] = useState(false);
  
  // Favorites/Reactions state
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("rae-favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  
  // Show keyboard shortcuts modal
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Clear chat confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // TTS Refs
  const utteranceRef = useRef(null);
  const currentWordIndexRef = useRef(0);
  const manualPauseRef = useRef(false);
  const synthRef = useRef(window.speechSynthesis);

  // STT Ref
  const recognitionRef = useRef(null);
  
  // Input ref for focusing
  const inputRef = useRef(null);

  const userId = "user-123";

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);

  // Save chat history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("rae-chat-history", JSON.stringify(chatHistory));
  }, [chatHistory]);
  
  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem("rae-favorites", JSON.stringify(favorites));
  }, [favorites]);
  
  // Save PDF mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("rae-pdf-mode", isPdfMode.toString());
  }, [isPdfMode]);

  // ------------------------------
  // 1) STT Initialization
  // ------------------------------
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("STT recognized text:", transcript);
        sendUserMessage(transcript);
        setSttActive(false);
      };

      recognition.onerror = (err) => {
        console.error("STT error:", err);
        setSttActive(false);
      };
      recognition.onend = () => {
        setSttActive(false);
      };
    }
  }, []);

  // ------------------------------
  // 2) Basic Handlers
  // ------------------------------
  const handleInputChange = (e) => {
    setUserMessage(e.target.value);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setChatHistory((prev) => [
        ...prev,
        { 
          sender: "bot", 
          message: `PDF file <strong>"${file.name}"</strong> uploaded.`, 
          timestamp: new Date() 
        },
      ]);
    }
  };

  const handlePdfModeChange = (e) => {
    setIsPdfMode(e.target.checked);
  };

  // Optional: local image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show the user's image in chat
      const imageURL = URL.createObjectURL(file);
      setChatHistory((prev) => [...prev, { 
        sender: "user", 
        image: imageURL,
        timestamp: new Date() 
      }]);

      // If you have a local analysis route
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("userId", userId);

        const response = await axios.post("/api/chat/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setChatHistory((prev) => [
          ...prev,
          { 
            sender: "bot", 
            message: response.data.reply,
            timestamp: new Date() 
          },
        ]);
      } catch (error) {
        console.error("Image analysis error:", error);
        setChatHistory((prev) => [
          ...prev,
          { 
            sender: "bot", 
            message: "Sorry, something went wrong with the image analysis.",
            timestamp: new Date()
          },
        ]);
      }
    }
  };
  
  // Clear chat history
  const clearChat = () => {
    setChatHistory([]);
    setShowClearConfirm(false);
    localStorage.removeItem("rae-chat-history");
  };

  // Add functions to handle conversation loading and deletion
  const handleLoadConversation = (savedConversation) => {
    if (savedConversation) {
      setChatHistory(savedConversation);
    } else {
      // If null is passed, clear the conversation to start new
      clearChat();
    }
  };
  
  const handleDeleteConversation = (id) => {
    // Just in case we need to perform any additional actions
    // when a conversation is deleted from the sidebar
    console.log(`Conversation ${id} deleted from sidebar`);
  };

  // ------------------------------
  // 3) Single Submit for Chat or Image Generation
  // ------------------------------
  const stripHtml = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const buildConversationContext = (newUserMessage) => {
    const newHistory = [...chatHistory, { sender: "user", message: newUserMessage, timestamp: new Date() }];

    return newHistory
      .map((msg) => {
        if (msg.sender === "user") {
          return `User: ${msg.message}`;
        } else {
          return `${stripHtml(msg.message)}`;
        }
      })
      .join("\n");
  };

  // The main function that handles "Send"
  const sendUserMessage = async (message) => {
    try {
      if (!message.trim()) {
        throw new Error("Please enter a message");
      }

      setLoading(true);
      setChatHistory(prev => [...prev, { 
        sender: "user", 
        message, 
        timestamp: new Date() 
      }]);

      let response;
      if (isPdfMode && pdfFile) {
        const formData = new FormData();
        formData.append("pdf", pdfFile);
        formData.append("message", message);
        formData.append("userId", userId);

        response = await axios.post("/api/chat/pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000 // 30 second timeout
        });
      } else if (imageMode) {
        response = await generateImage(message);
      } else {
        response = await axios.post("/api/chat", {
          message,
          userId
        }, {
          timeout: 15000 // 15 second timeout
        });
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const botMessage = {
        sender: "bot",
        message: response.data.reply,
        timestamp: new Date(),
        image: response.data.imageUrl // for image generation mode
      };

      setChatHistory(prev => [...prev, botMessage]);
      setUserMessage("");
      
      // Scroll to bottom after bot reply
      setTimeout(() => {
        const chatContainer = document.querySelector(".chat-messages");
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);

    } catch (error) {
      console.error("Error in sendUserMessage:", error);
      
      // Add error message to chat
      setChatHistory(prev => [...prev, {
        sender: "bot",
        message: `<span class="error-message">Error: ${error.message || "Failed to get response from AI"}. Please try again.</span>`,
        timestamp: new Date(),
        isError: true
      }]);
      
    } finally {
      setLoading(false);
      setPdfFile(null); // Clear PDF file after processing
    }
  };

  // The "Send" button
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const temp = userMessage;
    setUserMessage(""); // Clear input
    await sendUserMessage(temp);
  };

  // ------------------------------
  // 4) Image Generation (One Function)
  // ------------------------------
  const generateImage = async (prompt) => {
    setLoading(true);

    try {
      // Add user message to chat
      setChatHistory((prev) => [
        ...prev,
        { 
          sender: "user", 
          message: `Generating image for: "${prompt}"`,
          timestamp: new Date() 
        },
      ]);

      console.log("Generating image with prompt:", prompt);

      // Call Hugging Face Inference API directly for Stable Diffusion 3.5
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            options: { wait_for_model: true },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Hugging Face error: ${response.status} ${response.statusText}`);
      }

      // The model returns raw binary data, so read it as an arrayBuffer
      const arrayBuffer = await response.arrayBuffer();

      // Convert raw bytes to base64
      const base64String = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Create a data URL for the image
      const imageUrl = `data:image/png;base64,${base64String}`;

      // Add generated image as a bot message
      setChatHistory((prev) => [...prev, { 
        sender: "bot", 
        image: imageUrl,
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error("Hugging Face generation error:", error);
      let errorMessage = "Sorry, something went wrong with the image generation. Please try again later.";
      
      if (error.message && error.message.includes("429")) {
        errorMessage = "The image generation service is currently busy. Please try again in a few moments.";
      } else if (error.message && error.message.includes("401")) {
        errorMessage = "API key authentication failed. Please check your Hugging Face API key in Settings.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setChatHistory((prev) => [
        ...prev,
        { 
          sender: "bot", 
          message: errorMessage,
          timestamp: new Date() 
        },
      ]);
    }

    setLoading(false);
    setImageMode(false); // turn off image mode after generation
  };

  // ------------------------------
  // 5) TTS (Text-to-Speech)
  // ------------------------------
  const startSpeech = (text, index, startFrom = 0) => {
    const synth = synthRef.current;
    const words = stripHtml(text).split(/\s+/);
    if (!words.length || startFrom >= words.length) return;

    const utterance = new SpeechSynthesisUtterance(words.slice(startFrom).join(" "));
    utterance.rate = 1.0;
    utterance.pitch = 1.2;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        currentWordIndexRef.current += 1;
      }
    };
    utterance.onend = () => {
      setSpeakingIndex(null);
      setIsPaused(false);
    };

    setSpeakingIndex(index);
    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const pauseSpeech = () => {
    const synth = synthRef.current;
    manualPauseRef.current = true;
    synth.cancel();
    setIsPaused(true);
  };

  const resumeSpeech = (text, index) => {
    manualPauseRef.current = false;
    startSpeech(text, index, currentWordIndexRef.current);
    setIsPaused(false);
  };

  const toggleSpeech = (text, index) => {
    const synth = synthRef.current;
    if (speakingIndex === index) {
      if (!isPaused) {
        pauseSpeech();
      } else {
        resumeSpeech(text, index);
      }
    } else {
      synth.cancel();
      manualPauseRef.current = false;
      setIsPaused(false);
      currentWordIndexRef.current = 0;
      startSpeech(text, index, 0);
    }
  };

  // ------------------------------
  // 6) STT Toggle
  // ------------------------------
  const toggleSTT = () => {
    if (!recognitionRef.current) {
      console.log("SpeechRecognition not supported.");
      return;
    }
    if (sttActive) {
      recognitionRef.current.stop();
      setSttActive(false);
    } else {
      recognitionRef.current.start();
      setSttActive(true);
    }
  };

  // Toggle image mode
  const toggleImageMode = () => {
    setImageMode((prev) => !prev);
  };
  
  // NEW: Toggle favorite message
  const toggleFavorite = (index) => {
    if (favorites.includes(index)) {
      setFavorites(favorites.filter(i => i !== index));
    } else {
      setFavorites([...favorites, index]);
    }
  };
  
  // NEW: Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // NEW: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + Enter to send message
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit(e);
      }
      
      // Escape to cancel STT 
      if (e.key === 'Escape' && sttActive) {
        toggleSTT();
      }
      
      // Keyboard shortcuts:
      if (e.altKey) {
        // Alt+T for theme toggle
        if (e.key === 't') {
          toggleTheme();
        }
        // Alt+P for PDF mode toggle
        if (e.key === 'p') {
          setIsPdfMode(!isPdfMode);
        }
        // Alt+M for microphone/STT
        if (e.key === 'm') {
          toggleSTT();
        }
        // Alt+I for image mode
        if (e.key === 'i') {
          toggleImageMode();
        }
        // Alt+? for shortcuts help
        if (e.key === '?') {
          setShowShortcuts(!showShortcuts);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sttActive, isPdfMode, showShortcuts]);
  
  // Focus on input field on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // ------------------------------
  // 7) Auto-Scroll Chat
  // ------------------------------
  useEffect(() => {
    const chatBox = document.querySelector(".chat-box");
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [chatHistory]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleLoadConversation: (savedConversation) => {
      if (savedConversation) {
        setChatHistory(savedConversation);
      } else {
        // If null is passed, clear the conversation to start new
        clearChat();
      }
    },
    handleDeleteConversation: (id) => {
      console.log(`Conversation ${id} deleted from sidebar`);
    }
  }));

  // Update parent component with chat history changes
  useEffect(() => {
    if (updateChatHistory) {
      updateChatHistory(chatHistory);
    }
  }, [chatHistory, updateChatHistory]);

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <div className={`chat-page ${theme}`}>
      <div className="chat-header">
        <h1 className="app-title">RAE ASSISTANT</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={toggleTheme} 
            className="mode-toggle"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
            {theme === "light" ? "Dark" : "Light"}
          </button>

          <div className="pdf-toggle-wrap">
            <label className="switch">
              <input type="checkbox" checked={isPdfMode} onChange={handlePdfModeChange} />
              <span className="slider round"></span>
            </label>
            <span className="pdf-status">{isPdfMode ? <><FontAwesomeIcon icon={faFileUpload} /> PDF Mode</> : <>💬 Chat Mode</>}</span>
          </div>
          
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="help-button"
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            <FontAwesomeIcon icon={faKeyboard} />
          </button>
          
          <button
            onClick={() => setShowClearConfirm(true)}
            className="clear-button"
            aria-label="Clear chat history"
            title="Clear chat"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>

          <button
            className="settings-button"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
            title="Settings"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-tools">
          <ExportOptions chatHistory={chatHistory} />
        </div>
        
        <div className="chat-box">
          {chatHistory.length === 0 && (
            <div className="welcome-message" style={{
              textAlign: 'center',
              padding: '30px',
              color: theme === 'light' ? '#666' : '#aaa'
            }}>
              <h2 style={{marginBottom: '15px'}}>Welcome to RAE Assistant</h2>
              <p>How can I help you today?</p>
              <div className="shortcut-tip" style={{marginTop: '20px', fontSize: '0.9rem'}}>
                <p>💡 Press <kbd>Alt</kbd>+<kbd>?</kbd> for keyboard shortcuts</p>
              </div>
              
              <div className="example-prompts">
                <h3>Try these examples:</h3>
                <div className="prompt-list">
                  <div className="example-prompt" onClick={() => {
                    setUserMessage("Explain the difference between artificial intelligence, machine learning, and deep learning.");
                    handleSubmit({preventDefault: () => {}});
                  }}>
                    <span className="prompt-icon">🤖</span>
                    <p>Explain the difference between artificial intelligence, machine learning, and deep learning.</p>
                  </div>
                  
                  <div className="example-prompt" onClick={() => {
                    setUserMessage("Write a Python function to calculate the Fibonacci sequence.");
                    handleSubmit({preventDefault: () => {}});
                  }}>
                    <span className="prompt-icon">💻</span>
                    <p>Write a Python function to calculate the Fibonacci sequence.</p>
                  </div>
                  
                  <div className="example-prompt" onClick={() => {
                    setUserMessage("Create a weekly meal plan with recipes for a vegetarian diet.");
                    handleSubmit({preventDefault: () => {}});
                  }}>
                    <span className="prompt-icon">🥗</span>
                    <p>Create a weekly meal plan with recipes for a vegetarian diet.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {chatHistory.map((msg, index) => (
            <div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
              <div className="message-header">
                <span className="message-sender">{msg.sender === "user" ? "You" : "RAE"}</span>
                {msg.timestamp && <span className="message-time">{formatTime(msg.timestamp)}</span>}
              </div>
              
              <div className="message-content">
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="Generated or Uploaded"
                    style={{ maxWidth: "100%", borderRadius: "8px" }}
                  />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                )}
              </div>
              
              <div className="message-actions">
                {msg.sender === "bot" && !msg.image && (
                  <button
                    className="speak-button"
                    onClick={() => toggleSpeech(msg.message, index)}
                    aria-label={speakingIndex === index && !isPaused ? "Stop speaking" : "Read message aloud"}
                    title={speakingIndex === index && !isPaused ? "Stop speaking" : "Read aloud"}
                  >
                    <FontAwesomeIcon icon={speakingIndex === index && !isPaused ? faVolumeMute : faVolumeUp} />
                  </button>
                )}
                
                <button
                  className={`favorite-button ${favorites.includes(index) ? 'favorite-active' : ''}`}
                  onClick={() => toggleFavorite(index)}
                  aria-label={favorites.includes(index) ? "Remove from favorites" : "Add to favorites"}
                  title={favorites.includes(index) ? "Remove from favorites" : "Save for later"}
                >
                  <FontAwesomeIcon icon={favorites.includes(index) ? fasStar : farStar} />
                </button>
              </div>
            </div>
          ))}
          {loading && <div className="loading">RAE is thinking...</div>}
        </div>

        {/* Extra actions */}
        <div className="extra-actions" style={{ margin: "10px 0", display: "flex", gap: "12px", alignItems: "center", justifyContent: "flex-start" }}>
          <label htmlFor="image-upload" className="icon-button" title="Upload Image">
            <FontAwesomeIcon icon={faImage} />
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />

          <button 
            className={`icon-button ${sttActive ? 'active-stt' : ''}`} 
            onClick={toggleSTT} 
            title="Speech to Text (Alt+M)"
          >
            <FontAwesomeIcon icon={faMicrophone} />
            {sttActive && <span style={{marginLeft: '5px', fontSize: '0.9em'}}>Listening...</span>}
          </button>

          <button 
            className={`icon-button ${imageMode ? 'active-mode' : ''}`} 
            onClick={toggleImageMode} 
            title="Generate an Image (Alt+I)"
          >
            <FontAwesomeIcon icon={faImage} />
            {imageMode && <span style={{marginLeft: '5px', fontSize: '0.9em'}}>Image Mode</span>}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            ref={inputRef}
            type="text"
            value={userMessage}
            onChange={handleInputChange}
            placeholder={imageMode ? "Type an image prompt here..." : "Message RAE... (Ctrl+Enter to send)"}
            className="chat-input"
            aria-label="Message input"
          />
          <button type="submit" className="send-button" aria-label="Send message">
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>

          {isPdfMode && (
            <>
              <label htmlFor="pdf-upload" className="pdf-upload-button" title="Add PDF">
                <FontAwesomeIcon icon={faFileUpload} style={{marginRight: '8px'}} />
                Upload PDF
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                style={{ display: "none" }}
              />
            </>
          )}
        </form>

        {isPdfMode && pdfFile && (
          <div className="pdf-upload-status">
            <p>Using PDF: <strong>{pdfFile.name}</strong></p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showShortcuts && (
        <div className="shortcuts-modal">
          <div className="shortcuts-content">
            <div className="shortcuts-header">
              <h3>Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="close-button">×</button>
            </div>
            <div className="shortcuts-body">
              <table>
                <tbody>
                  <tr><td><kbd>Alt</kbd>+<kbd>P</kbd></td><td>Toggle PDF mode</td></tr>
                  <tr><td><kbd>Alt</kbd>+<kbd>I</kbd></td><td>Toggle image generation mode</td></tr>
                  <tr><td><kbd>Alt</kbd>+<kbd>M</kbd></td><td>Toggle speech-to-text</td></tr>
                  <tr><td><kbd>Ctrl/Cmd</kbd>+<kbd>Enter</kbd></td><td>Send message</td></tr>
                  <tr><td><kbd>Alt</kbd>+<kbd>?</kbd></td><td>Show/hide this help</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {showClearConfirm && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h3>Clear Chat History?</h3>
            <p>This will remove all messages. This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowClearConfirm(false)} className="cancel-button">Cancel</button>
              <button onClick={clearChat} className="confirm-button">Clear History</button>
            </div>
          </div>
        </div>
      )}
      
      {showSettings && (
        <Settings
          theme={theme}
          toggleTheme={toggleTheme}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
});

export default Chatbot;
