import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAccessToken } from '../../api/axiosSetup'; // The memory setter we made earlier
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// 1. Create the Context
const AuthContext = createContext();

// 2. Create a Provider Component
export const AuthProvider = ({ children }) => {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [user, setUser] = useState(null);

    // Helper function to decode and set user
  const authenticateSession = (token) => {
    setAccessToken(token);
    try {
      const decodedToken = jwtDecode(token);
      // 3. Extract the ID. (Ensure your Spring Boot backend includes 'userId' as a claim in the JWT!)
      setUser({ id: decodedToken.userId, email: decodedToken.sub }); 
      setIsUserLoggedIn(true);
    } catch (err) {
      console.error("Invalid token format", err);
    }
  };

    // NEW: The Silent Refresh Logic
    useEffect(() => {
        const attemptSilentRefresh = async () => {
            try {
                // Ping the backend using standard axios, ensuring cookies are sent
                const response = await axios.post('http://localhost:8080/api/auth/refresh', {}, {
                    withCredentials: true
                });

                authenticateSession(response.data.accessToken);
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
        authenticateSession(token);
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
            setUser(null);
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
        <AuthContext.Provider value={{ isUserLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Custom hook for easy importing
export const useAuth = () => useContext(AuthContext);