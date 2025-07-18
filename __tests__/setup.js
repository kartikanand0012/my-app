/**
 * Test Setup Configuration
 * Configures testing environment for Auth and AI-Automation tests
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillMount has been renamed')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test configuration
global.testConfig = {
  mockUsers: {
    admin: {
      id: 1,
      email: 'admin@example.com',
      password: 'Test123@Password',
      role: 'admin',
      name: 'Admin User'
    },
    teamLead: {
      id: 2,
      email: 'teamlead@example.com',
      password: 'Test123@Password',
      role: 'team-lead',
      name: 'Team Lead'
    },
    agent: {
      id: 3,
      email: 'agent@example.com',
      password: 'Test123@Password',
      role: 'agent',
      name: 'Agent User'
    }
  },
  mockApiEndpoints: {
    base: 'http://localhost:3000/api',
    auth: {
      login: '/auth/login',
      profile: '/auth/profile'
    },
    aiAgent: {
      query: '/ai-agent/query',
      prompts: '/ai-agent/prompts',
      history: '/ai-agent/query/history',
      schedule: '/ai-agent/schedule',
      teams: '/ai-agent/teams/test'
    }
  }
};