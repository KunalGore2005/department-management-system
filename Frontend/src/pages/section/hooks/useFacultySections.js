import { useCallback, useEffect, useState } from "react";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const useFacultySections = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${API}/api/coordinators/my-sections`, { credentials: "include" });
            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || "Unable to load your sections.");
            setSections(Array.isArray(result.data) ? result.data : []);
        } catch (requestError) {
            setError(requestError.message || "Unable to load your sections.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(refresh, 0);
        return () => clearTimeout(timer);
    }, [refresh]);

    return { sections, loading, error, refresh };
};

export default useFacultySections;
