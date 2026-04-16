# College Data - Modernized Web Application

Modernized from AS/400 RPG ILE (Synon/CA 2E generated) green-screen subfile application to a full-stack web application.

## Original System
- **MOB1CPP.pf** - Physical File DDS (database table)
- **MODYDFR.dspf** - Display File DDS (green-screen UI with subfile)
- **MODYDFR.rpgle** - RPG ILE program (810-line business logic)
- **MODYDFR.pnlgrp** - UIM Help Panel Group

## Modern Stack
- **Database**: PostgreSQL 16
- **Backend**: Node.js + Express REST API
- **Frontend**: React 18 + Vite

## Field Name Mapping (Synon to Modern)

| Synon Field | Modern Field | Type |
|-------------|-------------|------|
| B1UMC2 | account_id | VARCHAR(15), PRIMARY KEY |
| B1B9CO | college_name | VARCHAR(6) |
| B1X8TX | city | VARCHAR(25) |
| B1X9TX | state | VARCHAR(25) |
| B1CACO | pin_code | VARCHAR(6) |

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 16 (or Docker)

### 1. Start PostgreSQL

**Using Docker Compose (recommended):**
```bash
cd modernized
docker compose up -d postgres
```

**Using local PostgreSQL:**
```bash
psql -U postgres -c "CREATE DATABASE college_db;"
psql -U postgres -d college_db -f database/schema.sql
psql -U postgres -d college_db -f database/seed.sql
```

### 2. Start Backend
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:3001

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### Quick Start (all-in-one)
```bash
chmod +x start.sh
./start.sh
```

## API Endpoints

| Method | Endpoint | Description | Replaces |
|--------|----------|-------------|----------|
| GET | /api/colleges | List with pagination | BBLDSF subfile load |
| GET | /api/colleges?positionTo=X | Position-to query | SETLL/KPOS logic |
| GET | /api/colleges/:id | Single college detail | MODXD1R zoom |
| GET | /api/health | Health check | - |

### Query Parameters
- `page` (default: 1) - Page number
- `pageSize` (default: 12, matching SFLPAG) - Records per page
- `positionTo` - Account ID to start from

## Keyboard Shortcuts
- **F5** - Reset/refresh list
- **Escape** - Go back from detail view
- **Enter** - Submit position-to field

## Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Production Build
```bash
cd frontend
npm run build
```
