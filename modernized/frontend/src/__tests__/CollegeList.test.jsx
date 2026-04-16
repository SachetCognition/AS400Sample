import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CollegeList from '../components/CollegeList';

// Mock fetch
const mockColleges = {
  data: [
    { account_id: 'ACC001', college_name: 'IITB01', city: 'Mumbai', state: 'Maharashtra', pin_code: '400076' },
    { account_id: 'ACC002', college_name: 'IITD02', city: 'New Delhi', state: 'Delhi', pin_code: '110016' },
  ],
  page: 1,
  pageSize: 12,
  totalCount: 50,
  hasMore: true,
};

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockColleges),
    })
  );
});

describe('CollegeList', () => {
  it('renders table with correct columns', async () => {
    render(<CollegeList onViewCollege={vi.fn()} onMessage={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Account ID')).toBeInTheDocument();
      expect(screen.getByText('College Name')).toBeInTheDocument();
      expect(screen.getByText('City')).toBeInTheDocument();
      expect(screen.getByText('State')).toBeInTheDocument();
      expect(screen.getByText('Pin Code')).toBeInTheDocument();
    });
  });

  it('renders college data rows', async () => {
    render(<CollegeList onViewCollege={vi.fn()} onMessage={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('ACC001')).toBeInTheDocument();
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
    });
  });

  it('position-to input triggers API call', async () => {
    render(<CollegeList onViewCollege={vi.fn()} onMessage={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('ACC001')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('e.g. ACC020');
    fireEvent.change(input, { target: { value: 'ACC020' } });
    fireEvent.click(screen.getByText('Go'));

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls[global.fetch.mock.calls.length - 1];
      expect(lastCall[0]).toContain('positionTo=ACC020');
    });
  });

  it('pagination next page button works', async () => {
    render(<CollegeList onViewCollege={vi.fn()} onMessage={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('ACC001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Next Page/));

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls[global.fetch.mock.calls.length - 1];
      expect(lastCall[0]).toContain('page=2');
    });
  });
});
