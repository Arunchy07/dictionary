import React from "react";

const SearchHistory = ({ history, onSearch, favorites, onToggleFavorite }) => {
  return (
    <div className="search-history">
      <h3>Search History</h3>
      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>You haven't searched for any words yet.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((word, index) => (
            <div key={index} className="history-item">
              <span 
                className="history-word"
                onClick={() => onSearch(word)}
              >
                {word}
              </span>
              <button 
                className={`favorite-btn ${favorites.includes(word) ? 'active' : ''}`}
                onClick={() => onToggleFavorite(word)}
                aria-label={favorites.includes(word) ? "Remove from favorites" : "Add to favorites"}
              >
                {favorites.includes(word) ? '❤️' : '🤍'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;