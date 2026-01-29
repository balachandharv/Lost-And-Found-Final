import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, usersAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const result = await authAPI.getCurrentUser();
                    if (result.success) {
                        setUser(result.user);
                    } else {
                        // Token invalid, clear it
                        localStorage.removeItem("token");
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Fetch users if admin
    useEffect(() => {
        const fetchUsers = async () => {
            if (user && user.role === "Admin") {
                try {
                    const result = await usersAPI.getAll();
                    if (result.success) {
                        setUsers(result.users);
                    }
                } catch (error) {
                    console.error("Failed to fetch users:", error);
                }
            }
        };

        fetchUsers();
    }, [user]);

    const login = (userData) => {
        setUser(userData);
        return { success: true };
    };

    const updateUserStatus = async (id, newStatus) => {
        try {
            const result = await usersAPI.updateStatus(id, newStatus);
            if (result.success) {
                // Update local state
                setUsers(prev => prev.map(u =>
                    u.id === id ? { ...u, status: newStatus } : u
                ));

                // If we just blocked the currently logged in user, kick them out
                if (user && user.id === id && newStatus === "Blocked") {
                    logout();
                }
            }
            return result;
        } catch (error) {
            console.error("Update user status failed:", error);
            return { success: false, message: "Network error" };
        }
    };

    const updateProfile = (updatedData) => {
        if (!user) return { success: false, message: "No user logged in" };

        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        // In future: send to backend /api/users/profile endpoint
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        setUsers([]);
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    // Show nothing while checking auth
    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
                    <div style={{ color: "#64748b" }}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, users, login, logout, updateUserStatus, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
