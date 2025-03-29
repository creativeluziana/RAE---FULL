import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileAlt, faFileCode, faShareAlt, faCheck } from '@fortawesome/free-solid-svg-icons';

const ExportOptions = ({ chatHistory }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Strip HTML for text exports
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  
  // Format timestamp
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  const exportToText = () => {
    try {
      let content = "RAE ASSISTANT CONVERSATION\n";
      content += "==============================\n\n";
      content += `Exported on: ${new Date().toLocaleString()}\n\n`;
      
      chatHistory.forEach((msg) => {
        const sender = msg.sender === 'user' ? 'You' : 'RAE';
        const timestamp = msg.timestamp ? formatTime(msg.timestamp) : '';
        
        content += `[${sender}] ${timestamp}\n`;
        if (msg.message) {
          content += `${stripHtml(msg.message)}\n`;
        } else if (msg.image) {
          content += '[Image]\n';
        }
        content += '\n';
      });
      
      // Create a download link
      const element = document.createElement('a');
      const file = new Blob([content], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `RAE_conversation_${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showExportSuccess();
    } catch (err) {
      console.error('Error exporting to text:', err);
    }
  };
  
  const exportToHTML = () => {
    try {
      let content = `<!DOCTYPE html>
<html>
<head>
  <title>RAE Assistant Conversation</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; }
    .message { margin-bottom: 20px; padding: 15px; border-radius: 10px; }
    .user { background-color: #e6f2ff; text-align: right; }
    .bot { background-color: #f0f0f0; }
    .timestamp { font-size: 12px; color: #777; }
    .sender { font-weight: bold; }
    .image { max-width: 100%; height: auto; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RAE Assistant Conversation</h1>
    <p>Exported on: ${new Date().toLocaleString()}</p>
  </div>
  <div class="conversation">`;
      
      chatHistory.forEach((msg) => {
        const sender = msg.sender === 'user' ? 'You' : 'RAE';
        const timestamp = msg.timestamp ? formatTime(msg.timestamp) : '';
        
        content += `
    <div class="message ${msg.sender}">
      <div class="sender">${sender}</div>
      <div class="timestamp">${timestamp}</div>
      <div class="content">`;
        
        if (msg.message) {
          content += msg.message;
        } else if (msg.image) {
          content += `<img src="${msg.image}" alt="Conversation Image" class="image">`;
        }
        
        content += `
      </div>
    </div>`;
      });
      
      content += `
  </div>
</body>
</html>`;
      
      // Create a download link
      const element = document.createElement('a');
      const file = new Blob([content], {type: 'text/html'});
      element.href = URL.createObjectURL(file);
      element.download = `RAE_conversation_${new Date().toISOString().slice(0,10)}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showExportSuccess();
    } catch (err) {
      console.error('Error exporting to HTML:', err);
    }
  };
  
  const exportToJSON = () => {
    try {
      const data = {
        metadata: {
          exportDate: new Date().toISOString(),
          conversationLength: chatHistory.length
        },
        messages: chatHistory
      };
      
      // Create a download link
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = `RAE_conversation_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showExportSuccess();
    } catch (err) {
      console.error('Error exporting to JSON:', err);
    }
  };
  
  const showExportSuccess = () => {
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 3000);
  };

  return (
    <div className="export-options">
      <button 
        className="export-toggle"
        onClick={() => setShowOptions(!showOptions)}
        aria-label="Export conversation"
        aria-expanded={showOptions}
      >
        <FontAwesomeIcon icon={faShareAlt} />
        <span>Export</span>
      </button>
      
      {showOptions && (
        <div className="export-dropdown">
          <button onClick={exportToText} className="export-option">
            <FontAwesomeIcon icon={faFileAlt} />
            <span>Export as Text</span>
          </button>
          <button onClick={exportToHTML} className="export-option">
            <FontAwesomeIcon icon={faFilePdf} />
            <span>Export as HTML</span>
          </button>
          <button onClick={exportToJSON} className="export-option">
            <FontAwesomeIcon icon={faFileCode} />
            <span>Export as JSON</span>
          </button>
        </div>
      )}
      
      {exportSuccess && (
        <div className="export-success">
          <FontAwesomeIcon icon={faCheck} />
          <span>Exported successfully!</span>
        </div>
      )}
    </div>
  );
};

export default ExportOptions; 