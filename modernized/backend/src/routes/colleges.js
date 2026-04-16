// College REST API routes
// Replaces the subfile load (BBLDSF), display (CAEXFM), and zoom (MODXD1R) logic
// from MODYDFR.rpgle
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Scan limit - replaces W0SLM from MODYDFR.rpgle line 800
const SCAN_LIMIT = 500;

// Default page size - matches SFLPAG(12) from MODYDFR.dspf line 52
const DEFAULT_PAGE_SIZE = 12;

/**
 * GET /api/colleges
 * List colleges with pagination
 * Replaces BBLDSF subroutine (subfile load) from MODYDFR.rpgle lines 212-305
 *
 * Query params:
 *   page       - Page number (default 1)
 *   pageSize   - Records per page (default 12, matching SFLPAG)
 *   positionTo - Account ID to start from (replaces SETLL/KPOS logic, rpgle lines 194-200)
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || DEFAULT_PAGE_SIZE));
    const positionTo = (req.query.positionTo || '').trim();

    // Calculate offset - replaces ##RR relative record number tracking
    const offset = (page - 1) * pageSize;

    // Check scan limit - replaces W0SLM check from rpgle line 297
    if (offset >= SCAN_LIMIT) {
      // Y2U0017 - Scan limit reached
      return res.json({
        data: [],
        page,
        pageSize,
        totalCount: 0,
        hasMore: false,
        message: 'Scan limit reached',
        legacyMsgId: 'Y2U0017',
      });
    }

    let query;
    let countQuery;
    let params;
    let countParams;

    if (positionTo) {
      // Position-to query - replaces KPOS KLIST + SETLL from rpgle lines 195-199
      // Was: MOVEL Z2UMC2 B1UMC2 / KPOS SETLL FB1CPE6
      query = `SELECT * FROM colleges WHERE account_id >= $1 ORDER BY account_id LIMIT $2 OFFSET $3`;
      params = [positionTo, pageSize, offset];

      countQuery = `SELECT COUNT(*) FROM colleges WHERE account_id >= $1`;
      countParams = [positionTo];
    } else {
      // Full list - replaces initial READ FB1CPE6 from rpgle line 200
      query = `SELECT * FROM colleges ORDER BY account_id LIMIT $1 OFFSET $2`;
      params = [pageSize, offset];

      countQuery = `SELECT COUNT(*) FROM colleges`;
      countParams = [];
    }

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams),
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const hasMore = offset + dataResult.rows.length < totalCount && offset + pageSize < SCAN_LIMIT;

    // Trim whitespace from all string fields
    // Original RPG program uses fixed-length character fields
    const data = dataResult.rows.map((row) => ({
      account_id: (row.account_id || '').trim(),
      college_name: (row.college_name || '').trim(),
      city: (row.city || '').trim(),
      state: (row.state || '').trim(),
      pin_code: (row.pin_code || '').trim(),
    }));

    // If no records found, return empty with message
    // Replaces Y2U0008 message from rpgle line 276
    if (data.length === 0) {
      return res.json({
        data: [],
        page,
        pageSize,
        totalCount: 0,
        hasMore: false,
        message: 'No data to display',
        legacyMsgId: 'Y2U0008',
      });
    }

    res.json({
      data,
      page,
      pageSize,
      totalCount,
      hasMore,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/colleges/:accountId
 * Get single college detail
 * Replaces the CALL 'MODXD1R' zoom from MODYDFR.rpgle lines 439-445
 * (option 5 = Display on subfile selector Z1SEL)
 */
router.get('/:accountId', async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const result = await pool.query(
      'SELECT * FROM colleges WHERE account_id = $1',
      [accountId]
    );

    if (result.rows.length === 0) {
      // Y2U0032 - Record not found
      return res.status(404).json({
        error: 'College not found',
        message: `No college found with account ID: ${accountId}`,
        legacyMsgId: 'Y2U0032',
      });
    }

    const row = result.rows[0];
    // Trim whitespace from fixed-length character fields
    const college = {
      account_id: (row.account_id || '').trim(),
      college_name: (row.college_name || '').trim(),
      city: (row.city || '').trim(),
      state: (row.state || '').trim(),
      pin_code: (row.pin_code || '').trim(),
    };

    res.json(college);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
