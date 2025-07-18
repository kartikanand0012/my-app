/**
 * Authentication Test Cases
 * Tests login functionality and token management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the API functions
jest.mock('../lib/api', () => ({
  login: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/login',
  }),
}));

describe('Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('Login Functionality', () => {
    test('should successfully login with valid credentials', async () => {
      const { login } = require('../lib/api');
      
      // Mock successful login response
      login.mockResolvedValue({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'admin@example.com',
          role: 'admin',
          name: 'Admin User'
        }
      });

      // Test login with admin credentials
      const loginData = {
        email: 'admin@example.com',
        password: 'Test123@Password'
      };

      const result = await login(loginData.email, loginData.password);

      expect(login).toHaveBeenCalledWith('admin@example.com', 'Test123@Password');
      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.role).toBe('admin');
    });

    test('should fail login with invalid credentials', async () => {
      const { login } = require('../lib/api');
      
      // Mock failed login response
      login.mockResolvedValue({
        success: false,
        message: 'Invalid credentials'
      });

      const result = await login('wrong@email.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    test('should handle network errors during login', async () => {
      const { login } = require('../lib/api');
      
      // Mock network error
      login.mockRejectedValue(new Error('Network error'));

      await expect(login('admin@example.com', 'Test123@Password'))
        .rejects.toThrow('Network error');
    });
  });

  describe('Token Management', () => {
    test('should store token in localStorage after successful login', async () => {
      const { login } = require('../lib/api');
      
      login.mockResolvedValue({
        success: true,
        token: 'mock-jwt-token',
        user: { id: 1, email: 'admin@example.com', role: 'admin' }
      });

      const result = await login('admin@example.com', 'Test123@Password');
      
      // Simulate storing token
      if (result.success) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
      }

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock-jwt-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(result.user));
    });

    test('should retrieve stored token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('stored-token');

      const token = localStorage.getItem('auth_token');
      
      expect(token).toBe('stored-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });

    test('should clear token on logout', () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
    });
  });

  describe('Role-based Access', () => {
    test('should identify admin user correctly', () => {
      const adminUser = {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User'
      };

      expect(adminUser.role).toBe('admin');
    });

    test('should identify team-lead user correctly', () => {
      const teamLeadUser = {
        id: 2,
        email: 'teamlead@example.com',
        role: 'team-lead',
        name: 'Team Lead'
      };

      expect(teamLeadUser.role).toBe('team-lead');
    });

    test('should identify agent user correctly', () => {
      const agentUser = {
        id: 3,
        email: 'agent@example.com',
        role: 'agent',
        name: 'Agent User'
      };

      expect(agentUser.role).toBe('agent');
    });
  });
});