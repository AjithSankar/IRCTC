import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let memoryAccessToken = null; // Stored in memory

export const setAccessToken = (token) => {
    memoryAccessToken = token;
};

// Request Interceptor: Attach the Access Token to every request automatically
api.interceptors.request.use(
    (config) => {
        if (memoryAccessToken) {
            config.headers['Authorization'] = 'Bearer ' + memoryAccessToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401s and trigger the Refresh Token flow
api.interceptors.response.use(
    (response) => {
        return response; // Just return the response if it's successful
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // The browser will automatically send the HttpOnly refresh cookie!
                const res = await axios.post('http://localhost:8080/api/auth/refresh', {}, {
                    withCredentials: true 
                });

                setAccessToken(res.data.accessToken);
                originalRequest.headers['Authorization'] = 'Bearer ' + res.data.accessToken;
                
                return api(originalRequest); 
            } catch (err) {
                // Refresh failed (cookie expired or missing)
                setAccessToken(null);
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;