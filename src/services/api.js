// API Service Layer for Frontend
const API_BASE = 'http://localhost:5000/api';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Auth API
export const authAPI = {
    // Request OTP
    requestOTP: async (email) => {
        const response = await fetch(`${API_BASE}/auth/request-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return response.json();
    },

    // Verify OTP
    verifyOTP: async (email, otp) => {
        const response = await fetch(`${API_BASE}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        return response.json();
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: getAuthHeader()
        });
        return response.json();
    }
};

// Reports API
export const reportsAPI = {
    // Get all reports
    getAll: async () => {
        const response = await fetch(`${API_BASE}/reports`, {
            headers: getAuthHeader()
        });
        return response.json();
    },

    // Create report
    create: async (reportData) => {
        const response = await fetch(`${API_BASE}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(reportData)
        });
        return response.json();
    },

    // Delete report
    delete: async (id) => {
        const response = await fetch(`${API_BASE}/reports/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        return response.json();
    },

    // Update status
    updateStatus: async (id, status) => {
        const response = await fetch(`${API_BASE}/reports/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ status })
        });
        return response.json();
    }
};

// Users API (Admin only)
export const usersAPI = {
    // Get all users
    getAll: async () => {
        const response = await fetch(`${API_BASE}/users`, {
            headers: getAuthHeader()
        });
        return response.json();
    },

    // Update user status
    updateStatus: async (id, status) => {
        const response = await fetch(`${API_BASE}/users/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ status })
        });
        return response.json();
    }
};
