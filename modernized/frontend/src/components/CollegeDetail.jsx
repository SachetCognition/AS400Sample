import React, { useState, useEffect } from 'react';
import './CollegeDetail.css';

/**
 * CollegeDetail - Detail view for a single college
 * Replaces MODXD1R program call from MODYDFR.rpgle lines 439-445
 * Shows all fields for the selected college in a card layout
 */
function CollegeDetail({ accountId, onBack, onMessage }) {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/colleges/${accountId}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          // Y2U0032 - Record not found
          setError(errData.message || 'College not found');
          onMessage({
            type: 'error',
            text: errData.message || 'College not found',
            legacyMsgId: errData.legacyMsgId || 'Y2U0032',
          });
          return;
        }
        const data = await response.json();
        setCollege(data);
      } catch (err) {
        setError('Failed to load college details');
        onMessage({
          type: 'error',
          text: 'Failed to load college details',
          legacyMsgId: 'Y2U0035',
        });
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchDetail();
    }
  }, [accountId, onMessage]);

  // Handle Escape key to go back - replaces F3=Exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'F3') {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  if (loading) {
    return (
      <div className="detail-container">
        <div className="detail-loading">Loading college details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-container">
        <div className="detail-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={onBack}>
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h2>College Details</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          &larr; Back to List (F3)
        </button>
      </div>

      <div className="detail-card">
        {/* Field layout - replaces MODXD1R detail display */}
        <div className="detail-field">
          <label>Account ID</label>
          {/* Was B1UMC2 in MOB1CPP.pf */}
          <span className="field-value monospace">{college.account_id}</span>
        </div>

        <div className="detail-field">
          <label>College Name</label>
          {/* Was B1B9CO in MOB1CPP.pf */}
          <span className="field-value">{college.college_name}</span>
        </div>

        <div className="detail-field">
          <label>City</label>
          {/* Was B1X8TX in MOB1CPP.pf */}
          <span className="field-value">{college.city}</span>
        </div>

        <div className="detail-field">
          <label>State</label>
          {/* Was B1X9TX in MOB1CPP.pf */}
          <span className="field-value">{college.state}</span>
        </div>

        <div className="detail-field">
          <label>Pin Code</label>
          {/* Was B1CACO in MOB1CPP.pf */}
          <span className="field-value monospace">{college.pin_code}</span>
        </div>
      </div>

      <div className="detail-actions">
        <button className="btn btn-primary" onClick={onBack}>
          &larr; Back to List
        </button>
      </div>
    </div>
  );
}

export default CollegeDetail;
