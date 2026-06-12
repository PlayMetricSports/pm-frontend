/**
 * PlayMetric Console — Shared Helpers
 * Centralized utilities extracted from page-level duplicated logic.
 */

/**
 * Normalize API responses that may come in various envelope formats.
 * Handles: raw array, { data: [...] }, { data: { key: [...] } }, etc.
 * 
 * @param {any} response - The raw API response
 * @param {...string} keys - Optional nested keys to look for (e.g. 'orgs', 'employees')
 * @returns {Array} The extracted data array, or empty array
 */
export function normalizeApiResponse(response, ...keys) {
  if (Array.isArray(response)) return response;

  if (response && Array.isArray(response.data)) return response.data;

  // Check for nested keys like response.data.orgs, response.data.employees
  if (response?.data && typeof response.data === 'object') {
    for (const key of keys) {
      if (Array.isArray(response.data[key])) {
        return response.data[key];
      }
    }
    // Fallback: find any array inside response.data
    const innerKey = Object.keys(response.data).find(k => Array.isArray(response.data[k]));
    if (innerKey) return response.data[innerKey];
  }

  // Fallback: find any array at root level
  if (response && typeof response === 'object') {
    const arrayKey = Object.keys(response).find(k => Array.isArray(response[k]));
    if (arrayKey) return response[arrayKey];
  }

  return [];
}

/**
 * Check if a user object has admin privileges.
 * Replaces the 10+ inline admin checks scattered across the codebase.
 * 
 * @param {object|null} user - The user object from AuthContext
 * @returns {boolean}
 */
export function isUserAdmin(user) {
  if (!user) return false;
  return (
    user.userType === 'admin' ||
    user.userRoleName?.toLowerCase() === 'admin' ||
    user.isAdmin === 'yes'
  );
}

/**
 * Capitalize each word in a string, splitting on spaces, underscores, and hyphens.
 * 
 * @param {string} str
 * @returns {string}
 */
export function capitalizeWord(str) {
  if (!str) return '';
  return str
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format API error messages for user-friendly display.
 * Handles MongoDB duplicate key errors and JSON-encoded error arrays.
 * 
 * @param {string} errorString - The raw error message
 * @returns {string} A user-friendly error message
 */
export function formatErrorMessage(errorString) {
  if (!errorString) return 'An unknown error occurred.';

  // Try parsing as JSON array of errors
  try {
    const parsed = JSON.parse(errorString);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(err => {
        if (err.message?.includes('E11000 duplicate key error')) {
          if (err.message.includes('mobileNumber.number')) {
            return 'This mobile number is already registered to another user.';
          }
          if (err.message.includes('email')) {
            return 'This email address is already registered to another user.';
          }
          if (err.message.includes('employeeCode')) {
            return 'This employee code is already taken.';
          }
          return 'A record with duplicate unique details already exists.';
        }
        return err.message || JSON.stringify(err);
      }).join('\n');
    }
  } catch (e) {
    // Not a JSON error — continue
  }

  // Direct string checks for common errors
  if (errorString.includes('E11000 duplicate key error')) {
    if (errorString.includes('mobileNumber.number')) {
      return 'This mobile number is already registered to another user.';
    }
    return 'A duplicate key error occurred on the database.';
  }

  return errorString;
}

/**
 * Look up an organization name by ID from an orgs array.
 * 
 * @param {string} orgId
 * @param {Array} orgs - Array of org objects with _id and name
 * @returns {string}
 */
export function getOrgName(orgId, orgs) {
  if (!orgId) return 'Unknown Organisation';
  const idStr = typeof orgId === 'object' ? (orgId._id || orgId.id) : orgId;
  const orgObj = orgs.find(o => o._id === idStr);
  if (orgObj) return orgObj.name;
  if (typeof orgId === 'object' && orgId.name) return orgId.name;
  return 'Unknown Organisation';
}

/**
 * Look up a venue name by ID from a venues array.
 * 
 * @param {string|object} venueId
 * @param {Array} venues - Array of venue objects with _id and name
 * @returns {string}
 */
export function getVenueName(venueId, venues) {
  if (!venueId) return 'Unknown Venue';
  const idStr = typeof venueId === 'object' ? (venueId._id || venueId.id) : venueId;
  const venueObj = venues.find(v => v._id === idStr);
  if (venueObj) return venueObj.name;
  if (typeof venueId === 'object' && venueId.name) return venueId.name;
  return 'Unknown Venue';
}
