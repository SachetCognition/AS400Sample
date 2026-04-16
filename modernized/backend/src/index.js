// Express server entry point
// Replaces MODYDFR.rpgle main program logic
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const collegesRouter = require('./routes/colleges');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// REST API routes - replaces ZSFLCTL/ZSFLRCD display file interaction
app.use('/api/colleges', collegesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', program: 'MODYDFR (modernized)' });
});

// Error handling middleware
// Maps to legacy error message IDs for traceability
app.use((err, _req, res, _next) => {
  console.error('Server error:', err.message);
  // Y2U0035 - General processing error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An internal error occurred',
    legacyMsgId: 'Y2U0035',
  });
});

// Only start listening if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`College Data API running on port ${PORT}`);
    console.log(`Program: MODYDFR (modernized from AS/400 RPG ILE)`);
  });
}

module.exports = app;
