import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("carbontrack_token", token);

            localStorage.setItem(
                "carbontrack_user",
                JSON.stringify({
                    email: "Google User",
                })
            );

            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "22px",
            }}
        >
            Logging you in...
        </div>
    );
}