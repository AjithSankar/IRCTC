import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAccessToken } from '../../api/axiosSetup'; // The memory setter we made earlier
import axios from 'axios';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create a Provider Component
export const AuthProvider = ({ children }) => {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // NEW: The Silent Refresh Logic
    useEffect(() => {
        const attemptSilentRefresh = async () => {
            try {
                // Ping the backend using standard axios, ensuring cookies are sent
                const response = await axios.post('http://localhost:8080/api/auth/refresh', {}, {
                    withCredentials: true
                });

                // If it succeeds, the user is still logged in!
                setAccessToken(response.data.accessToken);
                setIsUserLoggedIn(true);
            } catch (error) {
                // If it fails (no cookie, or expired cookie), do nothing. 
                // They remain logged out.
                console.log("No active session found.");
            } finally {
                // Whether it succeeded or failed, we are done checking.
                setIsInitializing(false);
            }
        };

        attemptSilentRefresh();
    }, []);

    // Call this from Login.jsx after a successful login
    const login = (token) => {
        setAccessToken(token); // Put it in Axios memory
        setIsUserLoggedIn(true); // Update React state
    };

    // Call this from Home.jsx or a Navbar
    const logout = async () => {
        try {
            // 1. Tell the backend to kill the HttpOnly cookie
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout failed on server", err);
        } finally {
            // 2. Wipe the memory token
            setAccessToken(null);
            // 3. Update React state
            setIsUserLoggedIn(false);
        }
    };

    // NEW: Prevent the app from rendering while we check the session
    if (isInitializing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                {/* A simple CSS spinner */}
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-900 mb-4"></div>
                <p className="text-gray-500 font-medium tracking-wider">Connecting to IRCTC...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isUserLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Custom hook for easy importing
export const useAuth = () => useContext(AuthContext);