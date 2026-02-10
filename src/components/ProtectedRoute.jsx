import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Wrapper component that protects routes from unauthenticated access
 * 
 * @param {React.ReactNode} children - The component to render if authenticated
 * @param {string} requiredRole - Optional role requirement ('Admin' for admin-only routes)
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user } = useAuth();
    const location = useLocation();

    // If user is not logged in, redirect to login page
    // Save the current location so we can redirect back after login
    if (!user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname, message: "Please login to access this feature" }}
                replace
            />
        );
    }

    // If a specific role is required and user doesn't have it
    if (requiredRole && user.role !== requiredRole) {
        // Redirect non-admins trying to access admin pages to home
        return <Navigate to="/" replace />;
    }

    // User is authenticated (and has required role if specified)
    return children;
};

export default ProtectedRoute;
