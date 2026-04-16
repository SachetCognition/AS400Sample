-- Schema for modernized College Data application
-- Replaces MOB1CPP.pf Physical File DDS (CollegeDL - College data file)
-- Original record format: FB1CPE8

CREATE TABLE IF NOT EXISTS colleges (
  account_id VARCHAR(15) PRIMARY KEY,   -- Was B1UMC2 in MOB1CPP.pf
  college_name VARCHAR(6) NOT NULL,     -- Was B1B9CO in MOB1CPP.pf (CName)
  city VARCHAR(25),                     -- Was B1X8TX in MOB1CPP.pf (CCity)
  state VARCHAR(25),                    -- Was B1X9TX in MOB1CPP.pf (CState)
  pin_code VARCHAR(6)                   -- Was B1CACO in MOB1CPP.pf (CPinCode)
);

-- Index on account_id for efficient position-to queries
-- Replaces MOB1CPL0 logical file keyed access path
CREATE INDEX IF NOT EXISTS idx_colleges_account_id ON colleges (account_id);
