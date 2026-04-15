import React, { createContext, useContext, useState, useEffect } from "react";
import { Search } from 'lucide-react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Default demo accounts - PSR College IDs only
const DEFAULT_USERS = [
    { id: "U1", email: "23it001@psr.edu.in", password: "student123", role: "Student", name: "Student User", status: "Active" },
    { id: "U2", email: "23it008@psr.edu.in", password: "admin123", role: "Admin", name: "Balachandhar (Admin)", status: "Active" }
];

export const AuthProvider = ({ children }) => {
    // API URLs - moved to top to prevent ReferenceError
    const API_URL = "http://localhost:5000/api/auth";
    const USERS_API_URL = "http://localhost:5000/api/users";

    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch users from backend if admin
    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token || !user || user.role !== "Admin") return;

        try {
            const response = await fetch(USERS_API_URL, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
                localStorage.setItem("users", JSON.stringify(data.users));
            }
        } catch (error) {
            console.error("Fetch users error:", error);
        }
    };

    // Re-fetch users whenever user changes or on initial load if admin
    useEffect(() => {
        if (user && user.role === "Admin") {
            fetchUsers();
        }
    }, [user]);

    // Initialize users and check for existing session
    useEffect(() => {
        // Load users from localStorage or use defaults
        const storedUsers = localStorage.getItem("users");
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            setUsers(DEFAULT_USERS);
            localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
        }

        // Check for existing session
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.status !== "Blocked") {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            } catch (e) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }

        setLoading(false);
    }, []);

    // Login with email and password (Backend via Payload)
    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
                // Sync users list from localStorage for now to keep app working if mixed usage
                // In a full refactor, 'users' list should also come from backend
            }
            return data;
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Login failed. Server error." };
        }
    };

    // Validate college email
    const isValidCollegeEmail = (emailToCheck) => {
        const email = emailToCheck.toLowerCase().trim();

        // Must end with @psr.edu.in or @psr.edu
        if (!email.endsWith('@psr.edu.in') && !email.endsWith('@psr.edu')) {
            return { valid: false, message: "Only PSR college email IDs are allowed (@psr.edu.in or @psr.edu)." };
        }

        return { valid: true };
    };

    // Register new user (Backend)
    const register = async ({ name, email, password, role = "Student" }) => {
        // Validate college email Client-side first
        const validation = isValidCollegeEmail(email);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        const assignedRole = role;

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: assignedRole })
            });
            const data = await response.json();

            // If successful, also save to localStorage for hybrid compatibility if needed
            // But main source is now backend

            // Add to local users state for immediate UI update (Total Users count)
            if (data.success && data.user) {
                const updatedUsers = [...users, data.user];
                setUsers(updatedUsers);
                localStorage.setItem("users", JSON.stringify(updatedUsers));
            }

            return data;
        } catch (error) {
            console.error("Register error:", error);
            return { success: false, message: "Registration failed. Server error." };
        }
    };

    // --- Backend Integration for OTP ---

    const requestOtp = async (email, type = 'login') => {
        try {
            const response = await fetch(`${API_URL}/request-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Request OTP error:", error);
            // Fallback for demo/testing if backend is down
            return { success: false, message: "Failed to connect to server. Ensure backend is running." };
        }
    };

    // Reset Password
    const resetPassword = async (email, otp, newPassword) => {
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Reset Password error:", error);
            return { success: false, message: "Server error." };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await fetch(`${API_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
            }
            return data;
        } catch (error) {
            console.error("Verify OTP error:", error);
            return { success: false, message: "Verification failed. Server error." };
        }
    };

    const resendOtp = async (email) => {
        return requestOtp(email);
    };

    // Update user status (Admin function)
    const updateUserStatus = async (id, newStatus) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`${USERS_API_URL}/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                const updatedUsers = users.map(u =>
                    u.id === id ? { ...u, status: newStatus } : u
                );
                setUsers(updatedUsers);
                localStorage.setItem("users", JSON.stringify(updatedUsers));

                // If blocked the current user, log them out
                if (user && user.id === id && newStatus === "Blocked") {
                    logout();
                }
            }
            return data;
        } catch (error) {
            console.error("Update status error:", error);
            return { success: false, message: "Server error" };
        }
    };

    // Update user profile
    const updateProfile = (updatedData) => {
        if (!user) return { success: false, message: "No user logged in" };

        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));

        // Update in users list
        const updatedUsers = users.map(u => u.id === user.id ? { ...newUser, password: u.password } : u);
        setUsers(updatedUsers);
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        return { success: true };
    };

    // Delete User (Admin function)
    const deleteUser = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`${USERS_API_URL}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                const updatedUsers = users.filter(u => u.id !== id);
                setUsers(updatedUsers);
                localStorage.setItem("users", JSON.stringify(updatedUsers));

                if (user && user.id === id) {
                    logout();
                }
            }
            return data;
        } catch (error) {
            console.error("Delete user error:", error);
            return { success: false, message: "Server error" };
        }
    };

    // Logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    // Loading screen
    if (loading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div className="spinner-container" style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
                        <div className="loading-spinner"></div>
                    </div>
                    <div style={{ color: "#64748b", fontWeight: 600, letterSpacing: "0.025em" }}>Verifying Session...</div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            users,
            login,
            logout,
            register,
            updateUserStatus,
            updateProfile,
            requestOtp,
            verifyOtp,
            resendOtp,
            resetPassword,
            deleteUser,
            refreshUsers: fetchUsers
        }}>
            {children}
        </AuthContext.Provider>
    );
};
