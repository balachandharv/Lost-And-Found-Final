import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Default demo accounts - PSR College IDs only
const DEFAULT_USERS = [
    { id: "U1", email: "23it001@psr.edu.in", password: "student123", role: "Student", name: "Student User", status: "Active" },
    { id: "U2", email: "23it008@psr.edu.in", password: "admin123", role: "Admin", name: "Balachandhar (Admin)", status: "Active" }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Login with email and password
    const login = (email, password) => {
        // Get latest users from state
        const currentUsers = JSON.parse(localStorage.getItem("users") || "[]");

        // Find user by email
        const foundUser = currentUsers.find(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!foundUser) {
            return { success: false, message: "No account found with this email. Please sign up first." };
        }

        if (foundUser.password !== password) {
            return { success: false, message: "Incorrect password. Please try again." };
        }

        if (foundUser.status === "Blocked") {
            return { success: false, message: "Your account has been blocked by an Admin." };
        }

        // Success - set user and persist
        const userData = { ...foundUser };
        delete userData.password; // Don't store password in session

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", `session_${Date.now()}`);

        return { success: true, user: userData };
    };

    // Validate college email - only PSR college IDs allowed
    const isValidCollegeEmail = (emailToCheck) => {
        const email = emailToCheck.toLowerCase().trim();

        // Must end with @psr.edu.in
        if (!email.endsWith('@psr.edu.in')) {
            return { valid: false, message: "Only PSR college email IDs are allowed." };
        }

        // Extract the ID part before @
        const idPart = email.split('@')[0];

        // Valid format: 23it001 to 23it030
        const validPattern = /^23it0(0[1-9]|[12][0-9]|30)$/;

        if (!validPattern.test(idPart)) {
            return { valid: false, message: "Invalid college ID. Only 23IT001 to 23IT030 are allowed." };
        }

        return { valid: true, isAdmin: idPart === '23it008' };
    };

    // Register new user (Mock)
    const register = ({ name, email, password, role = "Student" }) => {
        const currentUsers = JSON.parse(localStorage.getItem("users") || "[]");

        // Validate college email
        const validation = isValidCollegeEmail(email);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Check if email already exists
        const emailExists = currentUsers.some(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        if (emailExists) {
            return { success: false, message: "An account with this email already exists." };
        }

        // Auto-assign Admin role for 23it008
        const assignedRole = validation.isAdmin ? "Admin" : role;

        // Create new user
        const newUser = {
            id: `U${Date.now()}`,
            name,
            email: email.toLowerCase(),
            password,
            role: assignedRole,
            status: "Active",
            createdAt: new Date().toISOString()
        };

        // Add to users list
        const updatedUsers = [...currentUsers, newUser];
        setUsers(updatedUsers);
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        return { success: true, user: newUser };
    };

    // --- Backend Integration for OTP ---

    const API_URL = "http://localhost:5000/api/auth";

    const requestOtp = async (email) => {
        try {
            const response = await fetch(`${API_URL}/request-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Request OTP error:", error);
            // Fallback for demo/testing if backend is down
            return { success: false, message: "Failed to connect to server. Ensure backend is running." };
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
    const updateUserStatus = (id, newStatus) => {
        const updatedUsers = users.map(u =>
            u.id === id ? { ...u, status: newStatus } : u
        );
        setUsers(updatedUsers);
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        // If blocked the current user, log them out
        if (user && user.id === id && newStatus === "Blocked") {
            logout();
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

    // Logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
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
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                    <div style={{ color: "#64748b", fontWeight: 500 }}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, users, login, logout, register, updateUserStatus, updateProfile, requestOtp, verifyOtp, resendOtp }}>
            {children}
        </AuthContext.Provider>
    );
};
