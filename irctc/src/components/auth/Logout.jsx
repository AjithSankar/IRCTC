import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("irctc_access_token");
        localStorage.removeItem("irctc_refresh_token");
        navigate("/login");
    }, [navigate]);

    return null;
}

export default Logout;