import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb, 
  faQuestionCircle, 
  faInfoCircle, 
  faLink, 
  faBook,
  faCode,
  faTools,
  faRobot,
  faClipboard
} from '@fortawesome/free-solid-svg-icons';

const RightSidebar = () => {
  const [activeSection, setActiveSection] = useState('suggestions');
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="context-sidebar">
      <div className="context-header">
        <h2>Context Panel</h2>
      </div>
      
      <div className="context-tabs">
        <button 
          className={`context-tab ${activeSection === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveSection('suggestions')}
        >
          <FontAwesomeIcon icon={faLightbulb} />
          <span>Suggestions</span>
        </button>
        <button 
          className={`context-tab ${activeSection === 'help' ? 'active' : ''}`}
          onClick={() => setActiveSection('help')}
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
          <span>Help</span>
        </button>
        <button 
          className={`context-tab ${activeSection === 'info' ? 'active' : ''}`}
          onClick={() => setActiveSection('info')}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>About</span>
        </button>
      </div>
      
      <div className="context-content">
        {activeSection === 'suggestions' && (
          <div className="suggestions-section">
            <h3>Suggested Prompts</h3>
            <div className="suggestion-list">
              <div className="suggestion-item" onClick={() => copyToClipboard("Explain the difference between artificial intelligence, machine learning, and deep learning.")}>
                <FontAwesomeIcon icon={faRobot} className="suggestion-icon" />
                <div className="suggestion-content">
                  <p>Explain the difference between artificial intelligence, machine learning, and deep learning.</p>
                </div>
                <button className="copy-btn" title="Copy to clipboard">
                  <FontAwesomeIcon icon={faClipboard} />
                </button>
              </div>
              
              <div className="suggestion-item" onClick={() => copyToClipboard("Write a Python function to calculate the Fibonacci sequence.")}>
                <FontAwesomeIcon icon={faCode} className="suggestion-icon" />
                <div className="suggestion-content">
                  <p>Write a Python function to calculate the Fibonacci sequence.</p>
                </div>
                <button className="copy-btn" title="Copy to clipboard">
                  <FontAwesomeIcon icon={faClipboard} />
                </button>
              </div>
              
              <div className="suggestion-item" onClick={() => copyToClipboard("Create a weekly meal plan with recipes for a vegetarian diet.")}>
                <FontAwesomeIcon icon={faBook} className="suggestion-icon" />
                <div className="suggestion-content">
                  <p>Create a weekly meal plan with recipes for a vegetarian diet.</p>
                </div>
                <button className="copy-btn" title="Copy to clipboard">
                  <FontAwesomeIcon icon={faClipboard} />
                </button>
              </div>
            </div>
            
            <h3>Tools</h3>
            <div className="tools-list">
              <div className="tool-item">
                <FontAwesomeIcon icon={faTools} />
                <span>Stable Diffusion 3.5 Image Generator</span>
              </div>
              <div className="tool-item">
                <FontAwesomeIcon icon={faTools} />
                <span>PDF Analyzer</span>
              </div>
              <div className="tool-item">
                <FontAwesomeIcon icon={faTools} />
                <span>Voice Assistant</span>
              </div>
            </div>
          </div>
        )}
        
        {activeSection === 'help' && (
          <div className="help-section">
            <h3>Quick Help</h3>
            <div className="help-item">
              <h4>Getting Started</h4>
              <p>Type your question in the chat input and press Enter to get started. RAE can help with a wide range of topics.</p>
            </div>
            
            <div className="help-item">
              <h4>Using Files</h4>
              <p>Toggle PDF mode to upload and analyze documents. RAE can extract and discuss information from your PDFs.</p>
            </div>
            
            <div className="help-item">
              <h4>Creating Images</h4>
              <p>Click the image icon to enter image generation mode, then describe the image you'd like to create.</p>
            </div>
            
            <div className="help-item">
              <h4>Voice Features</h4>
              <p>Use the microphone button to speak your questions. You can also have RAE read responses aloud.</p>
            </div>
            
            <div className="help-item">
              <h4>Keyboard Shortcuts</h4>
              <p>Press Alt+? to see all available keyboard shortcuts for faster interaction.</p>
            </div>
          </div>
        )}
        
        {activeSection === 'info' && (
          <div className="info-section">
            <h3>About RAE Assistant</h3>
            <p>RAE is an AI assistant designed to help with a wide range of tasks, from answering questions to generating images and analyzing documents.</p>
            
            <div className="info-item">
              <h4>Capabilities</h4>
              <ul>
                <li>Natural language understanding</li>
                <li>Image generation with Stable Diffusion 3.5</li>
                <li>Document analysis</li>
                <li>Voice interaction</li>
                <li>Personalized responses</li>
              </ul>
            </div>
            
            <div className="info-item">
              <h4>Powered By</h4>
              <p>This assistant uses Google's Gemini API for intelligent responses and Hugging Face's Stable Diffusion 3.5 for image generation.</p>
              <p>You can configure your API keys in the Settings panel.</p>
            </div>
            
            <div className="info-item">
              <h4>Resources</h4>
              <div className="resource-links">
                <a href="#" className="resource-link">
                  <FontAwesomeIcon icon={faLink} />
                  <span>Documentation</span>
                </a>
                <a href="#" className="resource-link">
                  <FontAwesomeIcon icon={faLink} />
                  <span>API Reference</span>
                </a>
                <a href="#" className="resource-link">
                  <FontAwesomeIcon icon={faLink} />
                  <span>Privacy Policy</span>
                </a>
              </div>
            </div>
            
            <div className="version-info">
              <p>Version 1.0.0</p>
              <p>&copy; {new Date().getFullYear()} RAE AI Technologies</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar; 