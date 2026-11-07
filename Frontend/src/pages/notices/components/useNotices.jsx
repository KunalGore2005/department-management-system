import { useState, useEffect } from "react";

const useNotices = () => {
    const [noticeData, setNoticeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/notices`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to fetch notices"
                    );
                }

                setNoticeData(result.data);
            } catch (error) {
                console.error("Error fetching notices:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { noticeData, setNoticeData, loading, error };
};

export default useNotices;