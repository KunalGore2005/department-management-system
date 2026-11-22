import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const marksRequest = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } });
    const result = await response.json();
    if (!response.ok || result.success === false) throw new Error(result.message || "Marks request failed.");
    return result;
};

export default function useMarks(filters = {}) {
    const { examId, subjectId, sectionId, batchId, semester } = filters;
    const [marks, setMarks] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(Object.entries({ examId, subjectId, sectionId, batchId, semester }).filter(([, value]) => value));
            const [marksResult, examsResult] = await Promise.all([marksRequest(`/api/marks${query.size ? `?${query}` : ""}`), marksRequest("/api/marks/exams")]);
            setMarks(marksResult.data || []); setExams(examsResult.data || []);
        } catch (error) { toast.error(error.message); }
        finally { setLoading(false); }
    }, [examId, subjectId, sectionId, batchId, semester]);
    useEffect(() => { const timer = setTimeout(() => refresh(), 0); return () => clearTimeout(timer); }, [refresh]);
    return { marks, exams, loading, refresh };
}
