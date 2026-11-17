import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const attendanceRequest = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
        ...options,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...options.headers }
    });
    const result = await response.json();
    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Attendance request failed.");
    }
    return result;
};

export function useAttendanceData(role) {
    const [data, setData] = useState({ active: null, history: [], reports: [], allocations: [] });
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(async (quiet = false) => {
        try {
            if (!quiet) setLoading(true);
            const [active, history, reports, allocations] = await Promise.all([
                attendanceRequest("/api/attendance/active"),
                attendanceRequest("/api/attendance/history"),
                attendanceRequest("/api/attendance/report"),
                attendanceRequest("/api/faculty-subject-sections")
            ]);
            const historyRows = history.data || [];
            const departmentActive = role === "HOD"
                ? historyRows.find(item => item.status === "ACTIVE" && new Date(item.endTime) > new Date())
                : null;
            setData({ active: active.data || departmentActive || null, history: historyRows, reports: reports.data || [], allocations: allocations.data || [] });
        } catch (error) {
            if (!quiet) toast.error(error.message);
        } finally {
            if (!quiet) setLoading(false);
        }
    }, [role]);
    useEffect(() => {
        const timer = setTimeout(() => { refresh(); }, 0);
        return () => clearTimeout(timer);
    }, [refresh]);
    return { ...data, loading, refresh, setActive: active => setData(current => ({ ...current, active })) };
}

export function useStudentAttendance() {
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const [summaryResult, historyResult] = await Promise.all([
                attendanceRequest("/api/attendance/student"),
                attendanceRequest("/api/attendance/student/history")
            ]);
            setSummary(summaryResult.data);
            setHistory(historyResult.data || []);
        } catch (error) { toast.error(error.message); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => {
        const timer = setTimeout(() => { refresh(); }, 0);
        return () => clearTimeout(timer);
    }, [refresh]);
    return { summary, history, loading, refresh };
}
