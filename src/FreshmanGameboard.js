import React, { useState, useEffect } from 'react';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("setup") === "true") {
      setShowSettings(true);
    }
  }, []);

  return (
    <div>
      <h1>🎲 Freshman Gameboard</h1>
      
      {showSettings ? (
        <div className="settings-popup">
          {/* Your existing Settings code goes here */}
        </div>
      ) : (
        <div className="gameboard">
          {/* Your existing gameboard grid + student name/code entry goes here */}
        </div>
      )}
    </div>
  );
}

export default App;
