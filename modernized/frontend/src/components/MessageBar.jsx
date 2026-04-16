import React, { useEffect } from 'react';
import './MessageBar.css';

/**
 * MessageBar - Displays status/error messages
 * Replaces the ZASNMS message queue subroutine from MODYDFR.rpgle lines 552-583
 * and the ZMSGCTL message subfile from MODYDFR.dspf lines 417-424
 */
function MessageBar({ message, onDismiss }) {
  // Auto-dismiss info messages after 5 seconds
  useEffect(() => {
    if (message && message.type === 'info') {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  const typeClass = `message-bar message-${message.type || 'info'}`;

  return (
    <div className={typeClass} role="alert">
      <span className="message-text">{message.text}</span>
      {message.legacyMsgId && (
        <span className="message-id">[{message.legacyMsgId}]</span>
      )}
      <button className="message-dismiss" onClick={onDismiss} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}

export default MessageBar;
