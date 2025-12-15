const API_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // Only redirect on 401 if we have a token (meaning session expired)
    // Don't redirect on login failures
    if (response.status === 401 && token) {
      this.removeToken();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'An error occurred');
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // Auth endpoints
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getUsers() {
    return this.request('/auth/users');
  }

  async updateUser(id, userData) {
    return this.request(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/auth/users/${id}`, {
      method: 'DELETE',
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Budget endpoints
  async getObjectCodes() {
    return this.request('/budget/object-codes');
  }

  async createObjectCode(data) {
    return this.request('/budget/object-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateObjectCode(id, data) {
    return this.request(`/budget/object-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteObjectCode(id) {
    return this.request(`/budget/object-codes/${id}`, {
      method: 'DELETE',
    });
  }

  async getFiscalYears() {
    return this.request('/budget/fiscal-years');
  }

  async getCurrentFiscalYear() {
    return this.request('/budget/fiscal-years/current');
  }

  async createFiscalYear(data) {
    return this.request('/budget/fiscal-years', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setCurrentFiscalYear(id) {
    return this.request(`/budget/fiscal-years/${id}/set-current`, {
      method: 'PUT',
    });
  }

  async getBudgetEntries(fiscalYearId = null) {
    const query = fiscalYearId ? `?fiscalYearId=${fiscalYearId}` : '';
    return this.request(`/budget/entries${query}`);
  }

  async getBudgetEntry(id) {
    return this.request(`/budget/entries/${id}`);
  }

  async createBudgetEntry(data) {
    return this.request('/budget/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudgetEntry(id, data) {
    return this.request(`/budget/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBudgetEntry(id) {
    return this.request(`/budget/entries/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboardSummary(fiscalYearId = null) {
    const query = fiscalYearId ? `?fiscalYearId=${fiscalYearId}` : '';
    return this.request(`/budget/dashboard${query}`);
  }

  logout() {
    this.removeToken();
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const api = new ApiService();
export default api;
