import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach the Access Token to every request automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('irctc_access_token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
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
        return response; // If successful, just return the data
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 Unauthorized, and we haven't already retried this request
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried to prevent infinite loops

            try {
                const refreshToken = localStorage.getItem('irctc_refresh_token');
                
                // Call the Spring Boot refresh endpoint
                const res = await axios.post('http://localhost:8080/api/auth/refresh', {
                    refreshToken: refreshToken
                });

                // Save the NEW access token
                localStorage.setItem('irctc_access_token', res.data.accessToken);

                // Update the original failed request with the new token
                originalRequest.headers['Authorization'] = 'Bearer ' + res.data.accessToken;

                // Retry the original request!
                return api(originalRequest); 

            } catch (err) {
                // If the refresh token is ALSO expired, force logout
                console.error("Refresh token expired. Please login again.");
                localStorage.removeItem('irctc_access_token');
                localStorage.removeItem('irctc_refresh_token');
                window.location.href = '/login'; // Redirect to login
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;