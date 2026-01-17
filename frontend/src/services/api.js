const API_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  async parseErrorResponse(response) {
    let body;
    try {
      body = await response.clone().json();
    } catch {
      try {
        body = await response.clone().text();
      } catch {
        body = null;
      }
    }

    if (body && typeof body === 'object') {
      // Common shapes: { message }, ProblemDetails { title, detail, errors }, { error }
      const message = body.message || body.error || body.detail || body.title;

      if (body.errors && typeof body.errors === 'object') {
        const parts = [];
        for (const [field, messages] of Object.entries(body.errors)) {
          if (Array.isArray(messages)) {
            for (const msg of messages) parts.push(field ? `${field}: ${msg}` : msg);
          } else if (typeof messages === 'string') {
            parts.push(field ? `${field}: ${messages}` : messages);
          }
        }
        if (parts.length > 0) return parts.join('\n');
      }

      if (message) return String(message);
    }

    if (typeof body === 'string' && body.trim().length > 0) {
      return body;
    }

    // Friendly fallback by status
    if (response.status === 403) return "You don't have permission to perform this action.";
    if (response.status === 404) return 'Not found.';
    if (response.status >= 500) return 'Server error. Please try again.';
    return 'An error occurred.';
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
      const message = await this.parseErrorResponse(response);
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async download(endpoint) {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          message = data?.message || data?.title || data?.detail || message;
        } else {
          const text = await response.text();
          if (text) message = text;
        }
      } catch {
        // ignore parsing errors
      }
      throw new Error(message);
    }

    const blob = await response.blob();

    const disposition = response.headers.get('content-disposition') || '';
    const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const fileName = decodeURIComponent(match?.[1] || match?.[2] || '');

    return { blob, fileName };
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

  async getObjectCodeLevels() {
    return this.request('/budget/object-code-levels');
  }

  async createObjectCodeLevel(data) {
    return this.request('/budget/object-code-levels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateObjectCodeLevel(id, data) {
    return this.request(`/budget/object-code-levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteObjectCodeLevel(id) {
    return this.request(`/budget/object-code-levels/${id}`, {
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

  async updateReleases(budgetEntryId, data) {
    return this.request(`/budget/entries/${budgetEntryId}/releases`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getExpenseHistory(budgetEntryId) {
    return this.request(`/budget/entries/${budgetEntryId}/expenses`);
  }

  async addExpense(budgetEntryId, data) {
    return this.request(`/budget/entries/${budgetEntryId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDashboardSummary(fiscalYearId = null) {
    const query = fiscalYearId ? `?fiscalYearId=${fiscalYearId}` : '';
    return this.request(`/budget/dashboard${query}`);
  }

  async downloadConsolidatedBudgetReport(fiscalYearId) {
    const query = fiscalYearId ? `?fiscalYearId=${fiscalYearId}` : '';
    return this.download(`/reports/consolidated-budget${query}`);
  }

  // ==================== Contingent Bills ====================
  
  async getContingentBills() {
    return this.request('/contingentbill/contingent-bills');
  }

  async getContingentBill(id) {
    return this.request(`/contingentbill/contingent-bills/${id}`);
  }

  async createContingentBill(data) {
    return this.request('/contingentbill/contingent-bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContingentBill(id, data) {
    return this.request(`/contingentbill/contingent-bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveContingentBill(id, approvalType) {
    return this.request(`/contingentbill/contingent-bills/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvalType }),
    });
  }

  async rejectContingentBill(id, reason, amountLessDrawn = 0) {
    return this.request(`/contingentbill/contingent-bills/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, amountLessDrawn }),
    });
  }

  // ==================== Schedule of Payments ====================

  async getScheduleOfPayments() {
    return this.request('/contingentbill/schedule-of-payments');
  }

  async createScheduleOfPaymentsBatch(billIds) {
    return this.request('/contingentbill/schedule-of-payments/batch', {
      method: 'POST',
      body: JSON.stringify({ billIds }),
    });
  }

  async getScheduleOfPayment(id) {
    return this.request(`/contingentbill/schedule-of-payments/${id}`);
  }

  async updateScheduleOfPayment(id, data) {
    return this.request(`/contingentbill/schedule-of-payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveScheduleOfPayment(id, approvalType) {
    return this.request(`/contingentbill/schedule-of-payments/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvalType }),
    });
  }

  // ==================== Asaan Cheques ====================

  async getAsaanCheques() {
    return this.request('/contingentbill/asaan-cheques');
  }

  async getAsaanCheque(id) {
    return this.request(`/contingentbill/asaan-cheques/${id}`);
  }

  async updateAsaanCheque(id, data) {
    return this.request(`/contingentbill/asaan-cheques/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveAsaanCheque(id, approvalType) {
    return this.request(`/contingentbill/asaan-cheques/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvalType }),
    });
  }

  async forwardAsaanCheque(id, bankDetails, referenceNumber) {
    return this.request(`/contingentbill/asaan-cheques/${id}/forward`, {
      method: 'POST',
      body: JSON.stringify({ bankDetails, referenceNumber }),
    });
  }

  // ==================== Workflow API ====================

  // Get bills based on role queue
  async getMyQueueBills() {
    return this.request('/workflow/bills/my-queue');
  }

  async getComputerOperatorBills() {
    return this.request('/workflow/bills/computer-operator');
  }

  async getAccountantBills() {
    return this.request('/workflow/bills/accountant');
  }

  async getAccountOfficerBills() {
    return this.request('/workflow/bills/account-officer');
  }

  async getAuditOfficerBills() {
    return this.request('/workflow/bills/audit-officer');
  }

  async getSeniorBudgetOfficerBills() {
    return this.request('/workflow/bills/senior-budget-officer');
  }

  async getDirectorFinanceBills() {
    return this.request('/workflow/bills/director-finance');
  }

  async getApprovedBills() {
    return this.request('/workflow/bills/approved');
  }

  async getRejectedBills() {
    return this.request('/workflow/bills/rejected');
  }

  // Workflow actions
  async saveBillAsDraft(id) {
    return this.request(`/workflow/bills/${id}/save-draft`, {
      method: 'POST',
    });
  }

  async submitToAccountOfficer(id, remarks) {
    return this.request(`/workflow/bills/${id}/submit-to-account-officer`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async accountantApprove(id, remarks) {
    return this.request(`/workflow/bills/${id}/accountant-approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async accountOfficerApprove(id, remarks) {
    return this.request(`/workflow/bills/${id}/account-officer-approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async auditOfficerApprove(id, remarks) {
    return this.request(`/workflow/bills/${id}/audit-officer-approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async seniorBudgetOfficerApprove(id, remarks) {
    return this.request(`/workflow/bills/${id}/senior-budget-officer-approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async directorFinanceApprove(id, remarks) {
    return this.request(`/workflow/bills/${id}/director-finance-approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async rejectBill(id, reason) {
    return this.request(`/workflow/bills/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async returnBill(id, remarks) {
    return this.request(`/workflow/bills/${id}/return`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  // PO Search
  async searchPurchaseOrders(query) {
    try {
      const data = await this.request(`/workflow/search-po?query=${encodeURIComponent(query || '')}`);
      const list = Array.isArray(data) ? data : data?.purchaseOrders || [];
      if (list.length > 0) return data;
    } catch {
      // fallback below
    }

    const fallbackUrl = `http://localhost:6100/api/purchase-orders/public?search=${encodeURIComponent(
      query || ''
    )}`;
    const response = await fetch(fallbackUrl);
    if (!response.ok) return [];
    return response.json();
  }

  async createBillFromPO(poData) {
    return this.request('/workflow/bills/create-from-po', {
      method: 'POST',
      body: JSON.stringify(poData),
    });
  }

  // Bill details and history
  async getBillDetails(id) {
    return this.request(`/workflow/bills/${id}/details`);
  }

  async getBillHistory(id) {
    return this.request(`/workflow/bills/${id}/history`);
  }

  // Workflow stats
  async getWorkflowStats() {
    return this.request('/workflow/stats');
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
