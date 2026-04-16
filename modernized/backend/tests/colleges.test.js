// Backend API tests for College Data REST API
// Tests the endpoints that replace MODYDFR.rpgle subfile logic
const http = require('http');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

describe('GET /api/colleges', () => {
  test('returns paginated results with 12 per page (matching SFLPAG)', async () => {
    const res = await request('/api/colleges');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(12);
    expect(res.body.pageSize).toBe(12);
    expect(res.body.page).toBe(1);
    expect(res.body.totalCount).toBeDefined();
  });

  test('returns records starting from positionTo value (replaces SETLL/KPOS)', async () => {
    const res = await request('/api/colleges?positionTo=ACC020');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    if (res.body.data.length > 0) {
      expect(res.body.data[0].account_id >= 'ACC020').toBe(true);
    }
  });

  test('returns page 2 results', async () => {
    const res = await request('/api/colleges?page=2');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.data).toBeDefined();
  });

  test('returns "No data to display" for non-existent high account ID (replaces Y2U0008)', async () => {
    const res = await request('/api/colleges?positionTo=ZZZZZZZ');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.message).toBe('No data to display');
  });
});

describe('GET /api/colleges/:accountId', () => {
  test('returns single college record', async () => {
    const res = await request('/api/colleges/ACC001');
    expect(res.status).toBe(200);
    expect(res.body.account_id).toBe('ACC001');
    expect(res.body.college_name).toBeDefined();
    expect(res.body.city).toBeDefined();
    expect(res.body.state).toBeDefined();
    expect(res.body.pin_code).toBeDefined();
  });

  test('returns 404 for invalid ID (replaces Y2U0032)', async () => {
    const res = await request('/api/colleges/NONEXISTENT');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('College not found');
  });
});

describe('GET /api/health', () => {
  test('returns health status', async () => {
    const res = await request('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
