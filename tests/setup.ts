import "@jest/globals";

// This file runs before all tests
// Add any global test setup here

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;
