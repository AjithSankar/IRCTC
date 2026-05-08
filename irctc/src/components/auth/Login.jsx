import { useState } from "react";
import { Link, useNavigate, useLocation} from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "../../api/axiosSetup";

function Login() {

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

   // Check if they were redirected here from a protected route
    const from = location.state?.from?.pathname + location.state?.from?.search || '/';

    // State to hold user credentials
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState('');

    // Handle input changes and update state
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({
            ...prev,
            [name]: value
        }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {

            const response = await api.post("/auth/login", credentials);

            if (response.data.accessToken) {
                // Redirect to home page or dashboard after successful login
                login(response.data.accessToken);
                navigate(from, { replace: true }); // Send them back to the booking page!
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        } catch (err) {
            setError('An error occurred while trying to log in. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">IRCTC Portal Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>

                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />

                    </div>

                    <button type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-semibold">
                        LOGIN
                    </button>

                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;