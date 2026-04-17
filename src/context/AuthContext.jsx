import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        // Check if a token exists in storage when the app mounts
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
        // In a real app, you'd verify this token with the backend here
        // For now, let's assume if it exists, they are logged in
        setUser({ token: savedToken }); 
        }
        setLoading(false);
    }, []);



    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    if (loading) return null; // Optionally, you could return a loading spinner here

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
        {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);