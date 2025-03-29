import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

const SearchMessages = ({ chatHistory, onResultClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Filter messages that contain the search query
    const filteredResults = chatHistory.map((msg, index) => {
      const messageText = msg.message || '';
      const messageContent = typeof messageText === 'string' 
        ? messageText.toLowerCase() 
        : '';
      
      if (messageContent.includes(searchQuery.toLowerCase())) {
        return { ...msg, index };
      }
      return null;
    }).filter(Boolean);
    
    setSearchResults(filteredResults);
    setShowResults(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleResultClick = (index) => {
    if (onResultClick) {
      onResultClick(index);
    }
    setShowResults(false);
  };

  // Strip HTML tags for preview
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className="search-messages">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="search-input"
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-search" 
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        <button type="submit" className="search-button" aria-label="Search">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </form>

      {showResults && (
        <div className="search-results">
          <div className="search-results-header">
            <h4>Search Results ({searchResults.length})</h4>
            <button onClick={clearSearch} className="close-results">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="results-list">
            {searchResults.length > 0 ? (
              searchResults.map((result, idx) => (
                <div 
                  key={idx} 
                  className="result-item"
                  onClick={() => handleResultClick(result.index)}
                >
                  <span className="result-sender">{result.sender === 'user' ? 'You' : 'RAE'}</span>
                  <p className="result-preview">
                    {result.message ? 
                      stripHtml(result.message).substring(0, 80) + (stripHtml(result.message).length > 80 ? '...' : '') 
                      : '[Image]'}
                  </p>
                </div>
              ))
            ) : (
              <p className="no-results">No messages found matching "{searchQuery}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchMessages; 