import React, { useState, useEffect } from "react";

function FreshmanGameboard() {
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
          <h2>⚙️ Counselor Setup</h2>
          <p>Paste your Google Sheet CSV link here:</p>
          <input type="text" placeholder="https://docs.google.com/.../pub?output=csv" />
          <button>Save</button>
        </div>
      ) : (
        <div className="gameboard">
          <h2>Welcome, Students!</h2>
          <p>Select your name and enter your code to unlock a mission tile.</p>
          {/* TODO: Insert your existing gameboard grid + code logic here */}
        </div>
      )}
    </div>
  );
}

export default FreshmanGameboard;
