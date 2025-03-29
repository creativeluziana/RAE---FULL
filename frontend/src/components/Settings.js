import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faPalette,
  faMoon,
  faSun,
  faFont,
  faVolumeHigh,
  faLanguage,
  faShield,
  faTimes,
  faCheck,
  faSliders
} from '@fortawesome/free-solid-svg-icons';

const Settings = ({ theme, toggleTheme, onClose }) => {
  const [activeSection, setActiveSection] = useState('appearance');
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('rae-font-size') || 'medium';
  });
  const [volume, setVolume] = useState(() => {
    return parseInt(localStorage.getItem('rae-volume') || '70');
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('rae-language') || 'en-US';
  });
  const [apiEndpoint, setApiEndpoint] = useState(() => {
    return localStorage.getItem('rae-api-endpoint') || 'http://localhost:5000/api/chat';
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('rae-api-key') || '';
  });
  const [hfApiKey, setHfApiKey] = useState(() => {
    return localStorage.getItem('rae-hf-api-key') || '';
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update font size in localStorage and apply to the document
  useEffect(() => {
    localStorage.setItem('rae-font-size', fontSize);
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  // Update volume in localStorage
  useEffect(() => {
    localStorage.setItem('rae-volume', volume.toString());
  }, [volume]);

  // Update language in localStorage
  useEffect(() => {
    localStorage.setItem('rae-language', language);
  }, [language]);

  // Reset success message after display
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const saveAPISettings = () => {
    localStorage.setItem('rae-api-endpoint', apiEndpoint);
    localStorage.setItem('rae-api-key', apiKey);
    localStorage.setItem('rae-hf-api-key', hfApiKey);
    setSaveSuccess(true);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2><FontAwesomeIcon icon={faCog} /> Settings</h2>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <button 
            className={`settings-nav-button ${activeSection === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveSection('appearance')}
          >
            <FontAwesomeIcon icon={faPalette} />
            <span>Appearance</span>
          </button>
          <button 
            className={`settings-nav-button ${activeSection === 'accessibility' ? 'active' : ''}`}
            onClick={() => setActiveSection('accessibility')}
          >
            <FontAwesomeIcon icon={faFont} />
            <span>Accessibility</span>
          </button>
          <button 
            className={`settings-nav-button ${activeSection === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveSection('voice')}
          >
            <FontAwesomeIcon icon={faVolumeHigh} />
            <span>Voice & Sound</span>
          </button>
          <button 
            className={`settings-nav-button ${activeSection === 'language' ? 'active' : ''}`}
            onClick={() => setActiveSection('language')}
          >
            <FontAwesomeIcon icon={faLanguage} />
            <span>Language</span>
          </button>
          <button 
            className={`settings-nav-button ${activeSection === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveSection('advanced')}
          >
            <FontAwesomeIcon icon={faSliders} />
            <span>Advanced</span>
          </button>
        </div>
        
        <div className="settings-panel">
          {activeSection === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance</h3>
              
              <div className="settings-option">
                <label>Theme</label>
                <div className="theme-toggle-container">
                  <button 
                    className={`theme-button ${theme === 'light' ? 'active' : ''}`}
                    onClick={toggleTheme}
                    disabled={theme === 'light'}
                  >
                    <FontAwesomeIcon icon={faSun} />
                    <span>Light</span>
                  </button>
                  <button 
                    className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
                    onClick={toggleTheme}
                    disabled={theme === 'dark'}
                  >
                    <FontAwesomeIcon icon={faMoon} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
              
              <div className="settings-option">
                <label>Message Spacing</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="message-spacing" 
                      value="compact" 
                      checked={fontSize === 'compact'}
                      onChange={() => setFontSize('compact')}
                    />
                    <span>Compact</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="message-spacing" 
                      value="medium" 
                      checked={fontSize === 'medium'}
                      onChange={() => setFontSize('medium')}
                    />
                    <span>Medium</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="message-spacing" 
                      value="spacious" 
                      checked={fontSize === 'spacious'}
                      onChange={() => setFontSize('spacious')}
                    />
                    <span>Spacious</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'accessibility' && (
            <div className="settings-section">
              <h3>Accessibility</h3>
              
              <div className="settings-option">
                <label>Font Size</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="font-size" 
                      value="small" 
                      checked={fontSize === 'small'}
                      onChange={() => setFontSize('small')}
                    />
                    <span>Small</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="font-size" 
                      value="medium" 
                      checked={fontSize === 'medium'}
                      onChange={() => setFontSize('medium')}
                    />
                    <span>Medium</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="font-size" 
                      value="large" 
                      checked={fontSize === 'large'}
                      onChange={() => setFontSize('large')}
                    />
                    <span>Large</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'voice' && (
            <div className="settings-section">
              <h3>Voice & Sound</h3>
              
              <div className="settings-option">
                <label>TTS Volume: {volume}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="volume-slider"
                />
              </div>
            </div>
          )}
          
          {activeSection === 'language' && (
            <div className="settings-section">
              <h3>Language</h3>
              
              <div className="settings-option">
                <label>Interface Language</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="language-select"
                >
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                  <option value="fr-FR">Français</option>
                  <option value="de-DE">Deutsch</option>
                  <option value="zh-CN">简体中文</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>
            </div>
          )}
          
          {activeSection === 'advanced' && (
            <div className="settings-section">
              <h3>Advanced Settings</h3>
              
              <div className="settings-option">
                <label>API Endpoint</label>
                <input 
                  type="text" 
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="api-input"
                  placeholder="http://localhost:5000/api/chat"
                />
                <p className="settings-help-text">Default endpoint is http://localhost:5000/api/chat</p>
              </div>
              
              <div className="settings-option">
                <label>Gemini API Key</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="api-input"
                  placeholder="Your Gemini API key"
                />
                <p className="settings-help-text">Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></p>
              </div>
              
              <div className="settings-option">
                <label>Hugging Face API Key</label>
                <input 
                  type="password" 
                  value={hfApiKey}
                  onChange={(e) => setHfApiKey(e.target.value)}
                  className="api-input"
                  placeholder="Your Hugging Face API key"
                />
                <p className="settings-help-text">Get your API key from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">Hugging Face</a></p>
              </div>
              
              <div className="settings-actions">
                <button 
                  className="save-api-button" 
                  onClick={saveAPISettings}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  <span>Save API Settings</span>
                </button>
                
                {saveSuccess && (
                  <div className="save-success">
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Settings saved successfully!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 