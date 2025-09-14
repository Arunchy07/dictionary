import React from "react";

const WordOfTheDay = ({ wordOfTheDay, onSearch, isLoading }) => {
  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-icon">⏳</div>
        <p>Loading word of the day...</p>
      </div>
    );
  }

  if (!wordOfTheDay) {
    return (
      <div className="error-state">
        <div className="error-icon">❌</div>
        <p>Failed to load word of the day.</p>
      </div>
    );
  }

  return (
    <div className="word-of-the-day">
      <h3>Word of the Day</h3>
      <div className="wotd-card">
        <h4>{wordOfTheDay.word}</h4>
        <p>{wordOfTheDay.meanings[0]?.definitions[0]?.definition}</p>
        <button onClick={() => onSearch(wordOfTheDay.word)}>
          Learn More
        </button>
      </div>
    </div>
  );
};

export default WordOfTheDay;