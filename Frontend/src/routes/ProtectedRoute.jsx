import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/me`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (response.status === 401) {
                    setUser(null);
                    return;
                }

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();

                if (data.authenticated && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }

            } catch (error) {
                console.error("Authentication check failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Checking authentication...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet context={user} />;
};

export default ProtectedRoute;