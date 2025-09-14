import React from "react";

const LanguageSelector = ({ language, setLanguage }) => {
  const languages = [
    { code: "hi", name: "Hindi" },
  ];

  return (
    <select 
      className="language-selector"
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;