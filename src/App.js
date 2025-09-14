import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchResult from "./components/SearchResult";
import SearchHistory from "./components/SearchHistory";
import ThemeToggle from "./components/ThemeToggle";
import LanguageSelector from "./components/LanguagesSelector";
import "./App.css";

function App() {
  const [word, setWord] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState("en");
  const [showAlert, setShowAlert] = useState(true);
  const [activePanel, setActivePanel] = useState("search");
  const [wordOfTheDay, setWordOfTheDay] = useState(null);
  const [isLoadingWOTD, setIsLoadingWOTD] = useState(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem("dictionarySearchHistory");
    const savedFavorites = localStorage.getItem("dictionaryFavorites");
    const savedTheme = localStorage.getItem("dictionaryTheme");
    const savedLanguage = localStorage.getItem("dictionaryLanguage");
    const hasSeenAlert = localStorage.getItem("hasSeenVocabMateAlert");
    
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedTheme) setIsDarkMode(savedTheme === "dark");
    if (savedLanguage) setLanguage(savedLanguage);
    if (hasSeenAlert) setShowAlert(false);
    
    document.documentElement.setAttribute("data-theme", savedTheme || "light");
  }, []);

  // Fetch word of the day on component mount
  useEffect(() => {
    fetchWordOfTheDay();
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("dictionarySearchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem("dictionaryFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dictionaryTheme", theme);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("dictionaryLanguage", language);
  }, [language]);
const fetchWordOfTheDay = async () => {
    setIsLoadingWOTD(true);  // Show a loading indicator
    try {
        // Send GET request to FastAPI endpoint with 'lang' as a query parameter
        const res = await axios.get("https://dictionary-api-byy8.onrender.com/word-of-the-day", {
            params: { lang: language },  // language is a state or variable controlling the language code
        });
        setWordOfTheDay(res.data);  // Save the response data into state
    } catch (err) {
        console.error("Failed to fetch word of the day:", err);  // Log errors
    } finally {
        setIsLoadingWOTD(false);  // Hide the loading indicator
    }
};


  const handleSearch = async (searchWord = word) => {
    if (!searchWord.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await axios.get("https://dictionary-api-byy8.onrender.com/search", {
        params: { word: searchWord, lang: language },
      });
      setResults(res.data.results);
      setError("");
      
      // Add to search history
      if (!searchHistory.includes(searchWord)) {
        setSearchHistory(prev => [searchWord, ...prev.slice(0, 9)]);
      }
      
      // Auto-speak the word
      if (res.data.results.length > 0 && res.data.results[0].word) {
        setTimeout(() => {
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(res.data.results[0].word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
          }
        }, 500);
      }
    } catch (err) {
      setResults([]);
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setWord(suggestion);
    handleSearch(suggestion);
    setActivePanel("results");
  };

  const handleWordOfTheDayClick = () => {
    if (wordOfTheDay) {
      setWord(wordOfTheDay.word);
      setResults([wordOfTheDay]);
      setActivePanel("results");
    }
  };

  const toggleFavorite = (word) => {
    if (favorites.includes(word)) {
      setFavorites(favorites.filter(fav => fav !== word));
    } else {
      setFavorites([...favorites, word]);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const closeAlert = () => {
    setShowAlert(false);
    localStorage.setItem("hasSeenVocabMateAlert", "true");
  };

  return (
    <div className="app">
      {/* VocabMate Alert */}
      {showAlert && (
        <div className="vocabmate-alert-overlay">
          <div className="vocabmate-alert">
            <div className="alert-header">
              <h2>Welcome to VocabMate! 🎓</h2>
              <button className="close-alert" onClick={closeAlert}>×</button>
            </div>
            <div className="alert-content">
              <p>VocabMate focuses on <strong>word definitions and meanings</strong>.</p>
              <p>Currently, we <strong>do not support sentence translations or analysis</strong>.</p>
              <div className="alert-features">
                <h3>What you can do:</h3>
                <ul>
                  <li>🔍 Search for word definitions</li>
                  <li>🎯 Get pronunciations</li>
                  <li>⭐ Save favorite words</li>
                  <li>🌙 Toggle dark/light mode</li>
                </ul>
              </div>
            </div>
            <div className="alert-footer">
              <button className="alert-button" onClick={closeAlert}>
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <h1>VocabMate</h1>
          <p>Your smart dictionary</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activePanel === "search" ? "active" : ""}`}
            onClick={() => setActivePanel("search")}
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Search</span>
          </button>
          
          <button 
            className={`nav-item ${activePanel === "history" ? "active" : ""}`}
            onClick={() => setActivePanel("history")}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-text">History</span>
            {searchHistory.length > 0 && (
              <span className="nav-badge">{searchHistory.length}</span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activePanel === "favorites" ? "active" : ""}`}
            onClick={() => setActivePanel("favorites")}
          >
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Favorites</span>
            {favorites.length > 0 && (
              <span className="nav-badge">{favorites.length}</span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activePanel === "wordOfDay" ? "active" : ""}`}
            onClick={() => {
              setActivePanel("wordOfDay");
              handleWordOfTheDayClick();
            }}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Word of the Day</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-controls">
            <LanguageSelector language={language} setLanguage={setLanguage} />
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
          <div className="app-info">
            <p>VocabMate v1.0</p>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="app-main">
        <header className="main-header">
          <h2>
            {activePanel === "search" && "Search Words"}
            {activePanel === "history" && "Search History"}
            {activePanel === "favorites" && "Favorite Words"}
            {activePanel === "wordOfDay" && "Word of the Day"}
          </h2>
          <div className="header-search">
            <input
              type="text"
              placeholder="Enter a word..."
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                if (e.target.value.length > 2) {
                  const filteredSuggestions = searchHistory.filter(
                    item => item.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  setSuggestions(filteredSuggestions);
                } else {
                  setSuggestions([]);
                }
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSearch()} 
              disabled={isLoading}
              className="search-button"
            >
              {isLoading ? '⏳' : '🔍'}
            </button>
            
            {suggestions.length > 0 && (
              <div className="suggestions-box">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>
        
        <div className="main-content">
          {activePanel === "search" && (
            <>
              {error && <div className="error-message">{error}</div>}
              
              {results.length === 0 && !error && (
                <div className="welcome-panel">
                  <div className="welcome-icon">📚</div>
                  <h3>Welcome to VocabMate</h3>
                  <p>Search for any word to get definitions, pronunciations, and more.</p>
                  <div className="feature-list">
                    <div className="feature">
                      <span className="feature-icon">🔊</span>
                      <span>Audio Pronunciations</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">🌐</span>
                      <span>Multiple Languages</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">⭐</span>
                      <span>Save Favorites</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="results-container">
                {results.map((item, index) => (
                  <SearchResult 
                    key={index} 
                    item={item} 
                    isFavorite={favorites.includes(item.word)}
                    onToggleFavorite={() => toggleFavorite(item.word)}
                    searchWord={word}
                  />
                ))}
              </div>
            </>
          )}
          
          {activePanel === "history" && (
            <SearchHistory 
              history={searchHistory} 
              onSearch={handleSuggestionClick}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}
          
          {activePanel === "favorites" && (
            <div className="favorites-panel">
              <h3>Your Favorite Words</h3>
              {favorites.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">⭐</div>
                  <p>You haven't saved any favorite words yet.</p>
                  <p>Search for words and click the heart icon to save them.</p>
                </div>
              ) : (
                <div className="favorites-list">
                  {favorites.map((favWord, index) => (
                    <div key={index} className="favorite-item">
                      <span className="favorite-word" onClick={() => handleSuggestionClick(favWord)}>
                        {favWord}
                      </span>
                      <button 
                        className="favorite-remove"
                        onClick={() => toggleFavorite(favWord)}
                        aria-label={`Remove ${favWord} from favorites`}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activePanel === "wordOfDay" && (
            <div className="word-of-day-panel">
              <h3>Word of the Day</h3>
              {isLoadingWOTD ? (
                <div className="loading-state">
                  <div className="loading-icon">⏳</div>
                  <p>Loading word of the day...</p>
                </div>
              ) : wordOfTheDay ? (
                <>
                  <div className="wotd-header">
                    <h4>{wordOfTheDay.word}</h4>
                    <button 
                      className="search-wotd-btn"
                      onClick={() => handleWordOfTheDayClick()}
                    >
                      View Details
                    </button>
                  </div>
                  <div className="results-container">
                    <SearchResult 
                      item={wordOfTheDay} 
                      isFavorite={favorites.includes(wordOfTheDay.word)}
                      onToggleFavorite={() => toggleFavorite(wordOfTheDay.word)}
                      searchWord={wordOfTheDay.word}
                    />
                  </div>
                </>
              ) : (
                <div className="error-state">
                  <div className="error-icon">❌</div>
                  <p>Failed to load word of the day.</p>
                  <button 
                    className="retry-btn"
                    onClick={() => fetchWordOfTheDay()}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;