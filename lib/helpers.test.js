import { describe, it, expect } from 'vitest';
import {
  normalizeApiResponse,
  isUserAdmin,
  capitalizeWord,
  formatErrorMessage,
  getOrgName,
  getVenueName
} from './helpers';

describe('Helpers', () => {
  describe('normalizeApiResponse', () => {
    it('should return raw array if passed an array', () => {
      const data = [{ id: 1 }];
      expect(normalizeApiResponse(data)).toEqual([{ id: 1 }]);
    });

    it('should return data array if present', () => {
      const response = { data: [{ id: 1 }] };
      expect(normalizeApiResponse(response)).toEqual([{ id: 1 }]);
    });

    it('should extract nested array based on keys', () => {
      const response = { data: { orgs: [{ id: 1 }] } };
      expect(normalizeApiResponse(response, 'orgs')).toEqual([{ id: 1 }]);
    });

    it('should fallback to first array found in data object', () => {
      const response = { data: { info: 'test', items: [{ id: 1 }] } };
      expect(normalizeApiResponse(response)).toEqual([{ id: 1 }]);
    });

    it('should fallback to first array found at root level', () => {
      const response = { meta: 'info', records: [{ id: 1 }] };
      expect(normalizeApiResponse(response)).toEqual([{ id: 1 }]);
    });

    it('should return empty array if no array found', () => {
      expect(normalizeApiResponse(null)).toEqual([]);
      expect(normalizeApiResponse({ data: { message: 'hello' } })).toEqual([]);
      expect(normalizeApiResponse('string')).toEqual([]);
    });
  });

  describe('isUserAdmin', () => {
    it('should return false if user is null or undefined', () => {
      expect(isUserAdmin(null)).toBe(false);
      expect(isUserAdmin(undefined)).toBe(false);
    });

    it('should return true if userType is admin', () => {
      expect(isUserAdmin({ userType: 'admin' })).toBe(true);
      expect(isUserAdmin({ userType: 'staff' })).toBe(false);
    });

    it('should return true if userRoleName is Admin (case-insensitive)', () => {
      expect(isUserAdmin({ userRoleName: 'Admin' })).toBe(true);
      expect(isUserAdmin({ userRoleName: 'admin' })).toBe(true);
      expect(isUserAdmin({ userRoleName: 'Manager' })).toBe(false);
    });

    it('should return true if isAdmin is yes', () => {
      expect(isUserAdmin({ isAdmin: 'yes' })).toBe(true);
      expect(isUserAdmin({ isAdmin: 'no' })).toBe(false);
    });
  });

  describe('capitalizeWord', () => {
    it('should capitalize single words', () => {
      expect(capitalizeWord('hello')).toBe('Hello');
      expect(capitalizeWord('HELLO')).toBe('Hello');
    });

    it('should split on spaces, underscores, and hyphens and capitalize each', () => {
      expect(capitalizeWord('hello_world')).toBe('Hello World');
      expect(capitalizeWord('hello-world')).toBe('Hello World');
      expect(capitalizeWord('hello world')).toBe('Hello World');
      expect(capitalizeWord('HELLO_WORLD')).toBe('Hello World');
    });

    it('should return empty string for falsy input', () => {
      expect(capitalizeWord('')).toBe('');
      expect(capitalizeWord(null)).toBe('');
    });
  });

  describe('formatErrorMessage', () => {
    it('should return default message if falsy', () => {
      expect(formatErrorMessage('')).toBe('An unknown error occurred.');
    });

    it('should handle JSON array with MongoDB duplicate key error (mobileNumber)', () => {
      const err = JSON.stringify([{ message: 'E11000 duplicate key error collection: test index: mobileNumber.number_1' }]);
      expect(formatErrorMessage(err)).toBe('This mobile number is already registered to another user.');
    });

    it('should handle JSON array with MongoDB duplicate key error (email)', () => {
      const err = JSON.stringify([{ message: 'E11000 duplicate key error collection: test index: email_1' }]);
      expect(formatErrorMessage(err)).toBe('This email address is already registered to another user.');
    });

    it('should handle JSON array with MongoDB duplicate key error (employeeCode)', () => {
      const err = JSON.stringify([{ message: 'E11000 duplicate key error collection: test index: employeeCode_1' }]);
      expect(formatErrorMessage(err)).toBe('This employee code is already taken.');
    });

    it('should handle JSON array with generic duplicate key error', () => {
      const err = JSON.stringify([{ message: 'E11000 duplicate key error collection: test index: unknown_1' }]);
      expect(formatErrorMessage(err)).toBe('A record with duplicate unique details already exists.');
    });

    it('should handle JSON array without special messages', () => {
      const err = JSON.stringify([{ message: 'Validation failed' }]);
      expect(formatErrorMessage(err)).toBe('Validation failed');
    });

    it('should handle raw duplicate key string (mobileNumber)', () => {
      const err = 'E11000 duplicate key error ... mobileNumber.number';
      expect(formatErrorMessage(err)).toBe('This mobile number is already registered to another user.');
    });

    it('should handle raw generic duplicate key string', () => {
      const err = 'E11000 duplicate key error ... some_other_field';
      expect(formatErrorMessage(err)).toBe('A duplicate key error occurred on the database.');
    });

    it('should return raw string if not matching any pattern', () => {
      expect(formatErrorMessage('Some random error')).toBe('Some random error');
    });
  });

  describe('getOrgName', () => {
    const orgs = [{ _id: '1', name: 'Org A' }, { _id: '2', name: 'Org B' }];
    
    it('should return correct org name', () => {
      expect(getOrgName('1', orgs)).toBe('Org A');
    });

    it('should return default if org not found', () => {
      expect(getOrgName('3', orgs)).toBe('Unknown Organisation');
    });
  });

  describe('getVenueName', () => {
    const venues = [{ _id: '1', name: 'Venue A' }, { _id: '2', name: 'Venue B' }];
    
    it('should return correct venue name', () => {
      expect(getVenueName('2', venues)).toBe('Venue B');
    });

    it('should return default if venue not found', () => {
      expect(getVenueName('3', venues)).toBe('Unknown Venue');
    });
  });
});
