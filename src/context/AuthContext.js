import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Default demo accounts
const DEFAULT_USERS = [
    { id: "U1", email: "cmariappan15@gmail.com", password: "student123", role: "Student", name: "Student User", status: "Active" },
    { id: "U2", email: "balachandhar021@gmail.com", password: "admin123", role: "Admin", name: "Admin User", status: "Active" }
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

    // Register new user
    const register = ({ name, email, password, role = "Student" }) => {
        const currentUsers = JSON.parse(localStorage.getItem("users") || "[]");

        // Check if email already exists
        const emailExists = currentUsers.some(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        if (emailExists) {
            return { success: false, message: "An account with this email already exists." };
        }

        // Create new user
        const newUser = {
            id: `U${Date.now()}`,
            name,
            email: email.toLowerCase(),
            password,
            role,
            status: "Active",
            createdAt: new Date().toISOString()
        };

        // Add to users list
        const updatedUsers = [...currentUsers, newUser];
        setUsers(updatedUsers);
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        return { success: true, user: newUser };
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
        <AuthContext.Provider value={{ user, users, login, logout, register, updateUserStatus, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
