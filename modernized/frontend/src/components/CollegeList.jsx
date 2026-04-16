import React, { useState, useEffect, useCallback } from 'react';
import './CollegeList.css';

/**
 * CollegeList - Main list view
 * Replaces the entire subfile ZSFLRCD + ZSFLCTL from MODYDFR.dspf
 * Includes position-to field, data table, pagination, and row actions
 */
const API_BASE = '/api/colleges';

function CollegeList({ onViewCollege, onMessage }) {
  const [colleges, setColleges] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [positionTo, setPositionTo] = useState('');
  const [appliedPositionTo, setAppliedPositionTo] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch colleges from API - replaces BBLDSF subroutine
  const fetchColleges = useCallback(async (pageNum, posTo) => {
    setLoading(true);
    onMessage(null);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: '12',
      });
      if (posTo) {
        params.set('positionTo', posTo);
      }

      const response = await fetch(`${API_BASE}?${params}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        onMessage({
          type: 'error',
          text: errData.message || 'Failed to load college data',
          legacyMsgId: errData.legacyMsgId || 'Y2U0035',
        });
        return;
      }
      const data = await response.json();

      setColleges(data.data || []);
      setHasMore(data.hasMore || false);
      setTotalCount(data.totalCount || 0);

      // Display messages from API (replaces ZASNMS message subroutine)
      if (data.message) {
        onMessage({
          type: data.legacyMsgId === 'Y2U0017' ? 'warning' : 'info',
          text: data.message,
          legacyMsgId: data.legacyMsgId,
        });
      }
    } catch (err) {
      onMessage({
        type: 'error',
        text: 'Failed to load college data',
        legacyMsgId: 'Y2U0035',
      });
    } finally {
      setLoading(false);
    }
  }, [onMessage]);

  // Initial load
  useEffect(() => {
    fetchColleges(1, '');
  }, [fetchColleges]);

  // Listen for reset events (F5 key)
  useEffect(() => {
    const handleReset = () => {
      setPage(1);
      setPositionTo('');
      setAppliedPositionTo('');
      fetchColleges(1, '');
    };
    window.addEventListener('resetList', handleReset);
    return () => window.removeEventListener('resetList', handleReset);
  }, [fetchColleges]);

  // Handle position-to submit - replaces SETLL/KPOS logic from rpgle lines 194-200
  const handlePositionTo = (e) => {
    e.preventDefault();
    const trimmed = positionTo.trim();
    setPage(1);
    setAppliedPositionTo(trimmed);
    fetchColleges(1, trimmed);
  };

  // Handle next page - replaces Roll Up / F8 from rpgle lines 171-172
  const handleNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchColleges(nextPage, appliedPositionTo);
  };

  // Handle previous page
  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchColleges(prevPage, appliedPositionTo);
    }
  };

  // Handle option 5 (View) - replaces Z1SEL option 5 zoom from rpgle line 439
  const handleOptionSelect = (accountId, option) => {
    if (option === '5') {
      onViewCollege(accountId);
    }
  };

  // Handle Enter in position-to field
  const handlePositionKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePositionTo(e);
    }
  };

  return (
    <div className="college-list">
      {/* Position-to field - replaces Z2UMC2 input from MODYDFR.dspf line 368 */}
      <form className="position-bar" onSubmit={handlePositionTo}>
        <label htmlFor="positionTo">Position to Account ID:</label>
        <input
          id="positionTo"
          type="text"
          value={positionTo}
          onChange={(e) => setPositionTo(e.target.value.toUpperCase())}
          onKeyDown={handlePositionKeyDown}
          placeholder="e.g. ACC020"
          maxLength={15}
          className="position-input"
        />
        <button type="submit" className="btn btn-primary">Go</button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setPositionTo('');
            setAppliedPositionTo('');
            setPage(1);
            fetchColleges(1, '');
          }}
        >
          Reset
        </button>
      </form>

      {/* Instructions - matches dspf lines 377-381 */}
      <div className="instructions">
        <span>Type options, press Enter.</span>
        <span className="option-hint">5=Display</span>
        {totalCount > 0 && (
          <span className="record-count">
            Showing page {page} ({colleges.length} of {totalCount} records)
          </span>
        )}
      </div>

      {/* Data table - replaces subfile ZSFLRCD columns from dspf lines 383-399 */}
      <div className="table-container">
        <table className="college-table">
          <thead>
            <tr>
              <th className="col-opt">Opt</th>
              <th className="col-account">Account ID</th>
              <th className="col-name">College Name</th>
              <th className="col-city">City</th>
              <th className="col-state">State</th>
              <th className="col-pin">Pin Code</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-cell">Loading...</td>
              </tr>
            ) : colleges.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">No data to display</td>
              </tr>
            ) : (
              colleges.map((college) => (
                <tr key={college.account_id}>
                  <td className="col-opt">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        handleOptionSelect(college.account_id, e.target.value);
                        e.target.value = '';
                      }}
                      className="opt-select"
                    >
                      <option value=""></option>
                      <option value="5">5</option>
                    </select>
                  </td>
                  <td className="col-account">
                    <button
                      className="link-btn"
                      onClick={() => onViewCollege(college.account_id)}
                      title="View details"
                    >
                      {college.account_id}
                    </button>
                  </td>
                  <td className="col-name">{college.college_name}</td>
                  <td className="col-city">{college.city}</td>
                  <td className="col-state">{college.state}</td>
                  <td className="col-pin">{college.pin_code}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - replaces Roll Up/F8 (ROLLUP) and SFLEND(*PLUS) */}
      <div className="pagination">
        <button
          className="btn btn-secondary"
          onClick={handlePrevPage}
          disabled={page <= 1 || loading}
        >
          Previous Page
        </button>
        <span className="page-info">Page {page}</span>
        <button
          className="btn btn-primary"
          onClick={handleNextPage}
          disabled={!hasMore || loading}
        >
          Next Page {hasMore ? '+' : ''}
        </button>
      </div>
    </div>
  );
}

export default CollegeList;
