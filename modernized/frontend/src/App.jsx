import React, { useState, useEffect, useCallback } from 'react';
import CollegeList from './components/CollegeList';
import CollegeDetail from './components/CollegeDetail';
import MessageBar from './components/MessageBar';
import './App.css';

/**
 * Main application layout
 * Replaces MODYDFR.dspf display file structure
 * Header shows "Display college data" matching dspf line 362
 * Shows current date and time matching dspf lines 355-359
 */
function App() {
  const [view, setView] = useState('list');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second - replaces ZZTME time field updates in rpgle
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts - preserve legacy UX feel
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F3 or Escape -> Exit/go back (replaces CA03 from dspf line 69)
      if (e.key === 'F3' || (e.key === 'Escape' && view === 'detail')) {
        e.preventDefault();
        if (view === 'detail') {
          setView('list');
          setSelectedAccountId(null);
        }
      }
      // F5 -> Reset/refresh (replaces CF05 from dspf line 70)
      if (e.key === 'F5') {
        e.preventDefault();
        setView('list');
        setSelectedAccountId(null);
        setMessage(null);
        window.dispatchEvent(new CustomEvent('resetList'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  // Handle viewing a college detail - replaces option 5 zoom (rpgle line 439)
  const handleViewCollege = useCallback((accountId) => {
    setSelectedAccountId(accountId);
    setView('detail');
    setMessage(null);
  }, []);

  // Handle going back to list - replaces F3=Exit behavior
  const handleBackToList = useCallback(() => {
    setView('list');
    setSelectedAccountId(null);
    setMessage(null);
  }, []);

  // Stable dismiss callback so MessageBar's auto-dismiss timer isn't reset by clock re-renders
  const handleDismissMessage = useCallback(() => setMessage(null), []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="app">
      {/* Header - replaces display file header from MODYDFR.dspf */}
      <header className="app-header">
        <div className="header-content">
          <h1>Display college data</h1>
          <div className="header-meta">
            <span className="program-name">MODYDFR</span>
            <span className="date-time">
              {formatDate(currentTime)} {formatTime(currentTime)}
            </span>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="app-main">
        {view === 'list' && (
          <CollegeList
            onViewCollege={handleViewCollege}
            onMessage={setMessage}
          />
        )}
        {view === 'detail' && (
          <CollegeDetail
            accountId={selectedAccountId}
            onBack={handleBackToList}
            onMessage={setMessage}
          />
        )}
      </main>

      {/* Message bar - replaces ZMSGCTL message subfile from dspf lines 417-424 */}
      <MessageBar message={message} onDismiss={handleDismissMessage} />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>Program: MODYDFR | Modernized from AS/400 RPG ILE</span>
          <span className="keyboard-hints">
            F5: Reset | Esc: Back | Enter: Submit
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
