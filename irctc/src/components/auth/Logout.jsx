import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const { logout } = useAuth();
        const handleLogout = async () => {
            await logout();
            navigate("/login");
        };
        handleLogout();
    }, [navigate]);

    return null;
}

export default Logout;