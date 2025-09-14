import React, { useState, useEffect } from "react";

const SearchResult = ({ item, isFavorite, onToggleFavorite, searchWord }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingDefinition, setIsSpeakingDefinition] = useState(false);
  const [isSpeakingHindi, setIsSpeakingHindi] = useState(false);
  const [activeCard, setActiveCard] = useState(0); // For slider functionality
  const [cards] = useState(['definitions', 'examples', 'relations']); // Card types

  // Get the word from the item or use searchWord as fallback
  const word = item?.word || searchWord || "Unknown word";
  
  // Auto-speak when the result appears
  useEffect(() => {
    if (word && word !== "Unknown word" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const timer = setTimeout(() => {
        speakWord(word);
      }, 500);
      
      return () => {
        clearTimeout(timer);
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [word]);

  const speakText = (text, setSpeakingState) => {
    if (!text) return;
    
    if (!window.speechSynthesis) {
      alert("Your browser does not support text-to-speech. Please try Chrome, Edge, or Safari.");
      return;
    }
    
    window.speechSynthesis.cancel();
    
    setSpeakingState(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setSpeakingState(false);
    };
    
    utterance.onerror = () => {
      setSpeakingState(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const speakWord = (text) => speakText(text, setIsSpeaking);
  const speakDefinition = () => speakText(item.definition_en, setIsSpeakingDefinition);
  const speakHindiDefinition = () => speakText(item.definition_hi, setIsSpeakingHindi);

  // Highlight the search word in text
  const highlightText = (text) => {
    if (!searchWord || !text) return text;
    
    const regex = new RegExp(`(${searchWord})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      part.toLowerCase() === searchWord.toLowerCase() 
        ? <mark key={index}>{part}</mark> 
        : part
    );
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const nextCard = () => {
    setActiveCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setActiveCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  // Don't render if item is not defined
  if (!item) return null;

  return (
    <div className="result-card">
      <div className="card-header">
        <div className="word-info">
          <div className="word-title-container">
            <h2 className="word-title">
              {word}
              {item.pronunciation && (
                <span className="phonetic">/{item.pronunciation}/</span>
              )}
            </h2>
            <div className="word-actions">
              <button 
                className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={() => speakWord(word)}
                aria-label="Pronounce word"
                disabled={isSpeaking || word === "Unknown word"}
              >
                {isSpeaking ? '⏹️' : '🔊'}
                <span className="tooltip">Listen to pronunciation</span>
              </button>
              <button 
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={onToggleFavorite}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? '❤️' : '🤍'}
                <span className="tooltip">{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
              </button>
            </div>
          </div>
          
          {item.partOfSpeech && (
            <div className="part-of-speech">
              <span className="pos-badge">{item.partOfSpeech}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Card slider navigation */}
      <div className="card-slider-nav">
        <button className="slider-nav-btn" onClick={prevCard} aria-label="Previous card">
          &#8249;
        </button>
        <div className="slider-dots">
          {cards.map((card, index) => (
            <button
              key={card}
              className={`slider-dot ${index === activeCard ? 'active' : ''}`}
              onClick={() => setActiveCard(index)}
              aria-label={`Show ${card} card`}
            />
          ))}
        </div>
        <button className="slider-nav-btn" onClick={nextCard} aria-label="Next card">
          &#8250;
        </button>
      </div>
      
      <div className="definition-content">
        {/* Definitions Card (Combined English and Hindi) */}
        <div className={`card-slide ${activeCard === 0 ? 'active' : ''}`}>
          <div className="definitions-container">
            <div className="definition-section">
              <div className="section-header">
                <h3 className="section-title">
                  <span className="icon">📝</span>
                  Definition
                </h3>
                <button 
                  className={`speak-btn small ${isSpeakingDefinition ? 'speaking' : ''}`}
                  onClick={speakDefinition}
                  aria-label="Pronounce definition"
                  disabled={isSpeakingDefinition}
                >
                  {isSpeakingDefinition ? '⏹️' : '🔊'}
                </button>
              </div>
              <p className="definition-text">{highlightText(item.definition_en)}</p>
            </div>
            
            {item.definition_hi && (
              <div className="definition-section">
                <div className="section-header">
                  <h3 className="section-title">
                    <span className="icon">🌏</span>
                    Hindi Definition
                  </h3>
                  <button 
                    className={`speak-btn small ${isSpeakingHindi ? 'speaking' : ''}`}
                    onClick={speakHindiDefinition}
                    aria-label="Pronounce Hindi definition"
                    disabled={isSpeakingHindi}
                  >
                    {isSpeakingHindi ? '⏹️' : '🔊'}
                  </button>
                </div>
                <p className="definition-text">{highlightText(item.definition_hi)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Examples Card */}
        {item.examples && item.examples.length > 0 && (
          <div className={`card-slide ${activeCard === 1 ? 'active' : ''}`}>
            <div className="examples-section">
              <h3 className="section-title">
                <span className="icon">💬</span>
                Examples ({item.examples.length})
              </h3>
              <div className="examples-list">
                {item.examples.slice(0, isExpanded ? item.examples.length : 2).map((ex, idx) => (
                  <div key={idx} className="example-item">
                    <span className="quote-mark">"</span>
                    {highlightText(ex)}
                    <span className="quote-mark">"</span>
                  </div>
                ))}
              </div>
              {item.examples.length > 2 && (
                <button className="expand-btn" onClick={toggleExpand}>
                  {isExpanded ? 'Show less' : `Show all ${item.examples.length} examples`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Relations Card */}
        <div className={`card-slide ${activeCard === 2 ? 'active' : ''}`}>
          <div className="relations-container">
            {item.synonyms && item.synonyms.length > 0 && (
              <div className="relations-section">
                <h3 className="section-title">
                  <span className="icon">🔄</span>
                  Synonyms
                </h3>
                <div className="relation-tags">
                  {item.synonyms.map((syn, idx) => (
                    <span key={idx} className="tag synonym-tag">{syn}</span>
                  ))}
                </div>
              </div>
            )}

            {item.antonyms && item.antonyms.length > 0 && (
              <div className="relations-section">
                <h3 className="section-title">
                  <span className="icon">⚡</span>
                  Antonyms
                </h3>
                <div className="relation-tags">
                  {item.antonyms.map((ant, idx) => (
                    <span key={idx} className="tag antonym-tag">{ant}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card-footer">
        <div className="word-source">
          <span className="source-text">Provided by Smart Dictionary</span>
          <span className="result-id">#{item.id || Math.floor(Math.random() * 1000)}</span>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;