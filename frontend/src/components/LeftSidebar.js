import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faHistory, 
  faStar, 
  faFolder, 
  faFolderPlus,
  faComments, 
  faTrash, 
  faEdit,
  faSearch,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const LeftSidebar = ({ chatHistory, onLoadConversation, onDeleteConversation }) => {
  const [activeTab, setActiveTab] = useState('history');
  const [savedChats, setSavedChats] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [folders, setFolders] = useState([]);
  
  // New folder creation state
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Edit folder state
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Load saved chats, favorites and folders from localStorage
  useEffect(() => {
    const localHistory = localStorage.getItem('rae-saved-chats');
    if (localHistory) {
      try {
        setSavedChats(JSON.parse(localHistory));
      } catch(e) {
        console.error('Error parsing saved chats:', e);
        // Default example chats if error occurs
        setSavedChats([
          { id: 1, title: 'Project Analysis', date: '2023-11-15', preview: 'Analyzed the market trends for...', folder: null },
          { id: 2, title: 'Meeting Notes', date: '2023-11-10', preview: 'Discussed the timeline for...', folder: null },
          { id: 3, title: 'Research Summary', date: '2023-11-05', preview: 'Found several papers on...', folder: null }
        ]);
      }
    } else {
      // Default example chats
      setSavedChats([
        { id: 1, title: 'Project Analysis', date: '2023-11-15', preview: 'Analyzed the market trends for...', folder: null },
        { id: 2, title: 'Meeting Notes', date: '2023-11-10', preview: 'Discussed the timeline for...', folder: null },
        { id: 3, title: 'Research Summary', date: '2023-11-05', preview: 'Found several papers on...', folder: null }
      ]);
    }
    
    const localFavorites = localStorage.getItem('rae-favorites-items');
    if (localFavorites) {
      try {
        setFavorites(JSON.parse(localFavorites));
      } catch(e) {
        console.error('Error parsing favorites:', e);
        // Default example favorites
        setFavorites([
          { id: 1, content: 'The analysis shows a 15% increase in user engagement after implementing the new features.', date: '2023-11-12' },
          { id: 2, content: 'Here are the steps to reproduce the issue: 1. Login to the admin dashboard...', date: '2023-11-08' }
        ]);
      }
    } else {
      // Default example favorites
      setFavorites([
        { id: 1, content: 'The analysis shows a 15% increase in user engagement after implementing the new features.', date: '2023-11-12' },
        { id: 2, content: 'Here are the steps to reproduce the issue: 1. Login to the admin dashboard...', date: '2023-11-08' }
      ]);
    }
    
    const localFolders = localStorage.getItem('rae-folders');
    if (localFolders) {
      try {
        setFolders(JSON.parse(localFolders));
      } catch(e) {
        console.error('Error parsing folders:', e);
        // Default example folders
        setFolders([
          { id: 1, name: 'Work Projects' },
          { id: 2, name: 'Personal' },
          { id: 3, name: 'Research' }
        ]);
      }
    } else {
      // Default example folders
      setFolders([
        { id: 1, name: 'Work Projects' },
        { id: 2, name: 'Personal' },
        { id: 3, name: 'Research' }
      ]);
    }
  }, []);
  
  // Save folders when they change
  useEffect(() => {
    localStorage.setItem('rae-folders', JSON.stringify(folders));
  }, [folders]);
  
  // Save chats when they change
  useEffect(() => {
    localStorage.setItem('rae-saved-chats', JSON.stringify(savedChats));
  }, [savedChats]);
  
  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = savedChats.filter(chat => 
      chat.title.toLowerCase().includes(query) || 
      chat.preview.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
    setIsSearching(true);
  }, [searchQuery, savedChats]);
  
  const addNewChat = () => {
    // Clear current chat and start new one
    if (onLoadConversation) {
      onLoadConversation(null);
    }
  };
  
  const saveCurrentChat = (title) => {
    if (!chatHistory || chatHistory.length === 0) return;
    
    // Create a summary from the chat
    const lastUserMessage = [...chatHistory]
      .reverse()
      .find(msg => msg.sender === 'user')?.message || '';
      
    const lastBotMessage = [...chatHistory]
      .reverse()
      .find(msg => msg.sender === 'bot')?.message || '';
      
    const preview = lastBotMessage.substring(0, 100) + (lastBotMessage.length > 100 ? '...' : '');
    
    const newChat = {
      id: Date.now(),
      title: title || lastUserMessage.substring(0, 30) + (lastUserMessage.length > 30 ? '...' : ''),
      date: new Date().toISOString().split('T')[0],
      preview,
      folder: null,
      conversation: chatHistory
    };
    
    setSavedChats([newChat, ...savedChats]);
  };
  
  const loadChat = (chat) => {
    if (onLoadConversation) {
      onLoadConversation(chat.conversation);
    }
  };
  
  const deleteChat = (id) => {
    if (onDeleteConversation) {
      onDeleteConversation(id);
    }
    setSavedChats(savedChats.filter(chat => chat.id !== id));
  };
  
  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    const folder = {
      id: Date.now(),
      name: newFolderName
    };
    
    setFolders([...folders, folder]);
    setNewFolderName('');
    setShowNewFolder(false);
  };
  
  const updateFolder = () => {
    if (!editFolderName.trim() || !editingFolder) return;
    
    setFolders(folders.map(folder => 
      folder.id === editingFolder 
        ? { ...folder, name: editFolderName }
        : folder
    ));
    
    setEditingFolder(null);
    setEditFolderName('');
  };
  
  const deleteFolder = (id) => {
    // First update all chats that were in this folder
    setSavedChats(savedChats.map(chat => 
      chat.folder === id 
        ? { ...chat, folder: null }
        : chat
    ));
    
    // Then remove the folder
    setFolders(folders.filter(folder => folder.id !== id));
  };
  
  const assignChatToFolder = (chatId, folderId) => {
    setSavedChats(savedChats.map(chat => 
      chat.id === chatId 
        ? { ...chat, folder: folderId }
        : chat
    ));
  };
  
  const getFolderName = (folderId) => {
    return folders.find(folder => folder.id === folderId)?.name || 'Unknown';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>RAE Assistant</h2>
        <button className="new-chat-button" onClick={addNewChat}>
          <FontAwesomeIcon icon={faPlus} />
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="sidebar-search">
        <div className="search-input-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sidebar-search-input"
          />
          {searchQuery && (
            <button 
              className="search-clear-button" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>
      
      {!isSearching && (
        <div className="sidebar-tabs">
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FontAwesomeIcon icon={faHistory} />
            <span>History</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <FontAwesomeIcon icon={faStar} />
            <span>Favorites</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'folders' ? 'active' : ''}`}
            onClick={() => setActiveTab('folders')}
          >
            <FontAwesomeIcon icon={faFolder} />
            <span>Folders</span>
          </button>
        </div>
      )}
      
      <div className="sidebar-content">
        {isSearching ? (
          <div className="search-results">
            <h3>Search Results ({searchResults.length})</h3>
            {searchResults.length > 0 ? (
              <div className="history-list">
                {searchResults.map(chat => (
                  <div key={chat.id} className="history-item" onClick={() => loadChat(chat)}>
                    <div className="history-icon">
                      <FontAwesomeIcon icon={faComments} />
                    </div>
                    <div className="history-details">
                      <h3>{chat.title}</h3>
                      <p className="history-date">{chat.date}</p>
                      {chat.folder && (
                        <p className="history-folder">
                          <FontAwesomeIcon icon={faFolder} /> {getFolderName(chat.folder)}
                        </p>
                      )}
                      <p className="history-preview">{chat.preview}</p>
                    </div>
                    <button className="history-delete" title="Delete conversation" onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No conversations found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : activeTab === 'history' ? (
          <div className="history-list">
            {savedChats.filter(chat => chat.folder === null).map(chat => (
              <div key={chat.id} className="history-item" onClick={() => loadChat(chat)}>
                <div className="history-icon">
                  <FontAwesomeIcon icon={faComments} />
                </div>
                <div className="history-details">
                  <h3>{chat.title}</h3>
                  <p className="history-date">{chat.date}</p>
                  <p className="history-preview">{chat.preview}</p>
                </div>
                <div className="history-actions">
                  <button className="history-action-button" title="Add to folder" onClick={(e) => {
                    e.stopPropagation();
                    // Show folder selection here
                  }}>
                    <FontAwesomeIcon icon={faFolderPlus} />
                  </button>
                  <button className="history-delete" title="Delete conversation" onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
            {savedChats.filter(chat => chat.folder === null).length === 0 && (
              <div className="empty-state">
                <p>No saved conversations yet</p>
                <button className="save-current-button" onClick={() => saveCurrentChat("New Conversation")}>
                  <FontAwesomeIcon icon={faSave} />
                  <span>Save Current Conversation</span>
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'favorites' ? (
          <div className="favorites-list">
            {favorites.map(fav => (
              <div key={fav.id} className="favorite-item">
                <div className="favorite-content">
                  <p>{fav.content}</p>
                  <span className="favorite-date">{fav.date}</span>
                </div>
              </div>
            ))}
            {favorites.length === 0 && (
              <div className="empty-state">
                <p>No favorite messages yet</p>
                <p className="empty-hint">Star a message to save it here</p>
              </div>
            )}
          </div>
        ) : activeTab === 'folders' ? (
          <div className="folders-section">
            <div className="folders-header">
              <h3>Your Folders</h3>
              <button 
                className="add-folder-button" 
                onClick={() => setShowNewFolder(true)}
                title="Create new folder"
              >
                <FontAwesomeIcon icon={faFolderPlus} />
              </button>
            </div>
            
            {showNewFolder && (
              <div className="folder-form">
                <input 
                  type="text" 
                  placeholder="Folder name" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="folder-input"
                  autoFocus
                />
                <div className="folder-form-actions">
                  <button className="folder-save" onClick={createFolder}>
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                  <button className="folder-cancel" onClick={() => setShowNewFolder(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            )}
            
            <div className="folders-list">
              {folders.map(folder => (
                <div key={folder.id} className="folder-item">
                  {editingFolder === folder.id ? (
                    <div className="folder-form inline">
                      <input 
                        type="text" 
                        value={editFolderName}
                        onChange={(e) => setEditFolderName(e.target.value)}
                        className="folder-input"
                        autoFocus
                      />
                      <div className="folder-form-actions">
                        <button className="folder-save" onClick={updateFolder}>
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button className="folder-cancel" onClick={() => setEditingFolder(null)}>
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faFolder} />
                      <span>{folder.name}</span>
                      <div className="folder-actions">
                        <button 
                          className="folder-edit" 
                          onClick={() => {
                            setEditingFolder(folder.id);
                            setEditFolderName(folder.name);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="folder-delete"
                          onClick={() => deleteFolder(folder.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Display conversations in the folders when clicked */}
              {folders.map(folder => (
                <div key={`content-${folder.id}`} className="folder-content">
                  <h4 className="folder-title">{folder.name}</h4>
                  <div className="history-list">
                    {savedChats.filter(chat => chat.folder === folder.id).map(chat => (
                      <div key={chat.id} className="history-item" onClick={() => loadChat(chat)}>
                        <div className="history-icon">
                          <FontAwesomeIcon icon={faComments} />
                        </div>
                        <div className="history-details">
                          <h3>{chat.title}</h3>
                          <p className="history-date">{chat.date}</p>
                          <p className="history-preview">{chat.preview}</p>
                        </div>
                        <button className="history-delete" title="Delete conversation" onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ))}
                    {savedChats.filter(chat => chat.folder === folder.id).length === 0 && (
                      <div className="empty-folder-state">
                        <p>No conversations in this folder</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {folders.length === 0 && (
              <div className="empty-state">
                <p>No folders created yet</p>
                <button 
                  className="create-folder-button" 
                  onClick={() => setShowNewFolder(true)}
                >
                  <FontAwesomeIcon icon={faFolderPlus} />
                  <span>Create New Folder</span>
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LeftSidebar; 