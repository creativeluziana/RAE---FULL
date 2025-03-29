import React, { useState } from 'react';

const EmojiReactions = ({ onReactionSelect }) => {
  const [showEmojis, setShowEmojis] = useState(false);
  
  const emojis = [
    { emoji: '👍', name: 'thumbs up' },
    { emoji: '❤️', name: 'heart' },
    { emoji: '😊', name: 'smile' },
    { emoji: '🎉', name: 'celebrate' },
    { emoji: '🤔', name: 'thinking' },
    { emoji: '👏', name: 'clap' },
    { emoji: '🙌', name: 'praise' },
    { emoji: '😮', name: 'wow' }
  ];
  
  const handleEmojiClick = (emoji) => {
    onReactionSelect(emoji);
    setShowEmojis(false);
  };
  
  return (
    <div className="emoji-reactions">
      <button 
        className="reaction-button"
        onClick={() => setShowEmojis(!showEmojis)}
        aria-label="Add reaction"
        aria-expanded={showEmojis}
      >
        😊
      </button>
      
      {showEmojis && (
        <div className="emoji-picker">
          {emojis.map((item, index) => (
            <button 
              key={index}
              className="emoji-option"
              onClick={() => handleEmojiClick(item.emoji)}
              aria-label={`React with ${item.name}`}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmojiReactions; 