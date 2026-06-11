const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pm-backend-1-8lum.onrender.com';

// Helper to get token in a browser environment from cookies
export function getAuthToken() {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/(^|;)\s*pm_token\s*=\s*([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
  }
  return null;
}

// Helper to set token in a browser environment in cookies
export function setAuthToken(token) {
  if (typeof window !== 'undefined') {
    if (token) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `pm_token=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
    } else {
      document.cookie = 'pm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
    }
  }
}

// Core fetcher with authorization header automatic attachment
export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !endpoint.endsWith('/login') && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      // response might not be json
    }

    let errorMessage = '';
    if (errorData) {
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = typeof errorData.message === 'object'
          ? JSON.stringify(errorData.message)
          : String(errorData.message);
      } else if (errorData.error) {
        errorMessage = typeof errorData.error === 'object'
          ? JSON.stringify(errorData.error)
          : String(errorData.error);
      } else {
        errorMessage = JSON.stringify(errorData);
      }
    } else {
      errorMessage = `HTTP error! status: ${response.status}`;
    }

    console.warn('API Error Response:', { status: response.status, errorData, errorMessage });

    const err = new Error(errorMessage);
    err.status = response.status;
    err.data = errorData;
    throw err;
  }

  // Some delete or logout requests might return empty or no-content response
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (e) {
    // If not json, return text or null
    return null;
  }
}

// API methods
export const api = {
  // Login
  login: async (email, password) => {
    try {
      const data = await apiFetch('/api/v1/account/authentication/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Response logged only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Login API raw response:', data);
      }

      if (data && (data.success === false || data.code === 401 || data.status === 'error')) {
        const errorMsg = data.error?.[0]?.message || data.message || 'Invalid email or password';
        throw new Error(errorMsg);
      }

      const token = data?.data?.token || data?.token;
      let userData = data?.data || data?.user;

      if (token && typeof token === 'string') {
        setAuthToken(token);
      }

      if (userData && typeof userData === 'object') {
        userData = { ...userData };
        delete userData.token;
      }

      // Save the login response and user data to localStorage (browser)
      if (typeof window !== 'undefined') {
        if (userData) {
          window.localStorage.setItem('pm_user', JSON.stringify(userData));
        }
        window.localStorage.setItem('pm_login_response', JSON.stringify(data));
      }

      return data;
    } catch (err) {
      console.error('Login error in api.js:', err);
      throw err;
    }
  },

  // Logout
  logout: async () => {
    const token = getAuthToken();

    try {
      await apiFetch('/api/v1/account/authentication/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.warn('Logout api request failed (this is safe to ignore on local/stub environments):', err);
    } finally {
      setAuthToken(null);
    }
  },

  // Verify authentication / Middleware call
  verifyAuth: async (token) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return await apiFetch('/api/v1/account/authentication', {
      method: 'GET',
      headers
    });
  },

  // Get all employees
  getEmployees: async () => {
    return await apiFetch('/api/v1/staff/employee', { method: 'GET' });
  },

  // Create an employee
  createEmployee: async (employeeData) => {
    return await apiFetch('/api/v1/staff/employee', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  // Update an employee
  updateEmployee: async (employeeData) => {
    // Since /api/v1/staff/employee/edit/ was defined in OpenAPI, we send a PATCH request
    return await apiFetch('/api/v1/staff/employee/edit/', {
      method: 'PATCH',
      body: JSON.stringify(employeeData),
    });
  },

  // Get user type, roles, and departments
  getMetadata: async () => {
    return await apiFetch('/api/v1/staff/employee/get-user-type-roles-and-dept', { method: 'GET' });
  },

  // Get user roles
  getUserRoles: async () => {
    return await apiFetch('/api/v1/account/user-role', { method: 'GET' });
  },

  // Create a user role
  createUserRole: async (roleData) => {
    return await apiFetch('/api/v1/account/user-role', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  },

  // Get action menu hierarchy
  getActionMenu: async () => {
    return await apiFetch('/api/v1/account/user-role/action-menu', { method: 'GET' });
  },

  // Update user role actions/permissions
  updateUserRoleActions: async (id, roleData) => {
    return await apiFetch(`/api/v1/account/user-role/edit/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(roleData),
    });
  },

  // Get Subsystems, Modules, Submodules, Actions
  getSubsystems: async () => {
    return await apiFetch('/api/v1/account/actions/subsystems', { method: 'GET' });
  },

  getModules: async () => {
    return await apiFetch('/api/v1/account/actions/modules', { method: 'GET' });
  },

  getSubmodules: async () => {
    return await apiFetch('/api/v1/account/actions/submodules', { method: 'GET' });
  },

  getActions: async (getAll = true) => {
    return await apiFetch(`/api/v1/account/actions/actions?getAll=${getAll}`, { method: 'GET' });
  },

  // Create Subsystem, Module, Submodule, Action
  createSubsystem: async (data) => {
    return await apiFetch('/api/v1/account/actions/subsystem/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createModule: async (data) => {
    return await apiFetch('/api/v1/account/actions/module/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createSubmodule: async (data) => {
    return await apiFetch('/api/v1/account/actions/submodule/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createAction: async (data) => {
    return await apiFetch('/api/v1/account/actions/action/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Organisation CRUD
  getOrganisations: async () => {
    return await apiFetch('/api/v1/organisation/org', { method: 'GET' });
  },

  getOrganisation: async (id) => {
    return await apiFetch(`/api/v1/organisation/org/${id}`, { method: 'GET' });
  },

  createOrganisation: async (orgData) => {
    return await apiFetch('/api/v1/organisation/org/create', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
  },

  updateOrganisation: async (id, orgData) => {
    return await apiFetch(`/api/v1/organisation/org/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(orgData),
    });
  },

  deleteOrganisation: async (id) => {
    return await apiFetch(`/api/v1/organisation/org/${id}`, { method: 'DELETE' });
  },

  // Venue CRUD
  getVenues: async (orgId = '', search = '') => {
    const query = new URLSearchParams();
    if (orgId) query.append('orgId', orgId);
    if (search) query.append('search', search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiFetch(`/api/v1/organisation/venue${queryString}`, { method: 'GET' });
  },

  getVenue: async (id) => {
    return await apiFetch(`/api/v1/organisation/venue/${id}`, { method: 'GET' });
  },

  createVenue: async (venueData) => {
    return await apiFetch('/api/v1/organisation/venue/create', {
      method: 'POST',
      body: JSON.stringify(venueData),
    });
  },

  updateVenue: async (id, venueData) => {
    return await apiFetch(`/api/v1/organisation/venue/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(venueData),
    });
  },

  deleteVenue: async (id, venueData = null) => {
    const options = { method: 'DELETE' };
    if (venueData) {
      options.body = JSON.stringify(venueData);
    }
    return await apiFetch(`/api/v1/organisation/venue/${id}`, options);
  },

  // Sport CRUD
  getSports: async (orgId = '', search = '') => {
    const query = new URLSearchParams();
    if (orgId) query.append('orgId', orgId);
    if (search) query.append('search', search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiFetch(`/api/v1/organisation/sport${queryString}`, { method: 'GET' });
  },

  getSport: async (id) => {
    return await apiFetch(`/api/v1/organisation/sport/${id}`, { method: 'GET' });
  },

  createSport: async (sportData) => {
    return await apiFetch('/api/v1/organisation/sport/create', {
      method: 'POST',
      body: JSON.stringify(sportData),
    });
  },

  updateSport: async (id, sportData) => {
    return await apiFetch(`/api/v1/organisation/sport/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(sportData),
    });
  },

  deleteSport: async (id, sportData = null) => {
    const options = { method: 'DELETE' };
    if (sportData) {
      options.body = JSON.stringify(sportData);
    }
    return await apiFetch(`/api/v1/organisation/sport/${id}`, options);
  },

  // Timeslot CRUD
  getTimeslots: async (orgId = '') => {
    const query = new URLSearchParams();
    if (orgId) query.append('orgId', orgId);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiFetch(`/api/v1/organisation/timeslot${queryString}`, { method: 'GET' });
  },

  getTimeslot: async (id) => {
    return await apiFetch(`/api/v1/organisation/timeslot/${id}`, { method: 'GET' });
  },

  createTimeslot: async (timeslotData) => {
    return await apiFetch('/api/v1/organisation/timeslot/create', {
      method: 'POST',
      body: JSON.stringify(timeslotData),
    });
  },

  updateTimeslot: async (id, timeslotData) => {
    return await apiFetch(`/api/v1/organisation/timeslot/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(timeslotData),
    });
  },

  deleteTimeslot: async (id, timeslotData = null) => {
    const options = { method: 'DELETE' };
    if (timeslotData) {
      options.body = JSON.stringify(timeslotData);
    }
    return await apiFetch(`/api/v1/organisation/timeslot/${id}`, options);
  }
};
