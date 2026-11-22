import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const settingsRequest = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });
    const result = await response.json();

    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Settings request failed.");
    }

    return result;
};

export const useProfileSettings = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const refreshProfile = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError("");

        try {
            const result = await settingsRequest("/api/profile");
            setProfile(result.data);
            return result.data;
        } catch (requestError) {
            setError(requestError.message || "Unable to load your profile.");
            throw requestError;
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => refreshProfile().catch(() => {}), 0);
        return () => clearTimeout(timer);
    }, [refreshProfile]);

    const updateProfile = async (values) => {
        setSaving(true);
        try {
            const result = await settingsRequest("/api/profile", {
                method: "PATCH",
                body: JSON.stringify(values)
            });
            if (result.data) setProfile(result.data);
            toast.success(result.message || "Profile updated successfully.");
            refreshProfile(false).catch(() => {});
            return true;
        } catch (requestError) {
            toast.error(requestError.message || "Unable to update your profile.");
            return false;
        } finally {
            setSaving(false);
        }
    };

    return { profile, loading, error, saving, refreshProfile, updateProfile };
};

export const useAcademicSettings = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [promotingBatchId, setPromotingBatchId] = useState(null);

    const refreshBatches = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError("");

        try {
            const result = await settingsRequest("/api/department-settings");
            setBatches(Array.isArray(result.data) ? result.data : []);
        } catch (requestError) {
            setError(requestError.message || "Unable to load academic settings.");
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => refreshBatches(), 0);
        return () => clearTimeout(timer);
    }, [refreshBatches]);

    const promoteBatch = async (batchId) => {
        setPromotingBatchId(batchId);
        try {
            const result = await settingsRequest(
                `/api/department-settings/${encodeURIComponent(batchId)}/promote`,
                { method: "PATCH", body: JSON.stringify({}) }
            );
            toast.success(result.message || "Batch promoted successfully.");
            await refreshBatches(false);
            return true;
        } catch (requestError) {
            toast.error(requestError.message || "Unable to promote this batch.");
            return false;
        } finally {
            setPromotingBatchId(null);
        }
    };

    return { batches, loading, error, promotingBatchId, refreshBatches, promoteBatch };
};
