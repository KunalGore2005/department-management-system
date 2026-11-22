import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clock3, GraduationCap, LoaderCircle, RefreshCw, UserRoundX, X } from "lucide-react";
import { toast } from "sonner";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const statuses = ["PENDING", "APPROVED", "REJECTED", "ALL"];
const badgeStyles = {
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
};

export default function Hod() {
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState("PENDING");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${API}/api/student-signup?status=${status}`, { credentials: "include" });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Failed to load student applications.");
            setRequests(Array.isArray(result.data) ? result.data : []);
        } catch (err) {
            setError(err.message || "Unable to load student applications.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => { refresh(); }, [refresh]);

    const counts = useMemo(() => requests.reduce((result, item) => {
        result[item.status] = (result[item.status] || 0) + 1;
        return result;
    }, {}), [requests]);

    const review = async (request, nextStatus) => {
        setUpdatingId(request.request_id);
        try {
            const response = await fetch(`${API}/api/student-signup/${request.request_id}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Unable to update application.");
            toast.success(result.message || `Application ${nextStatus.toLowerCase()}.`);
            await refresh();
        } catch (err) {
            toast.error(err.message || "Unable to update application.");
        } finally {
            setUpdatingId(null);
        }
    };

    const dateLabel = value => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

    return (
        <main className="min-h-full space-y-6 p-4 md:p-6 dark:bg-black">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"><GraduationCap size={23} /></span>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student applications</h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review student details and approve eligible applications.</p>
                    </div>
                </div>
                <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </header>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Application status">
                {statuses.map(item => (
                    <button key={item} type="button" role="tab" aria-selected={status === item} onClick={() => setStatus(item)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${status === item ? "bg-blue-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
                        {item === "ALL" ? "All applications" : `${item.charAt(0)}${item.slice(1).toLowerCase()}${item === "PENDING" && counts.PENDING ? ` (${counts.PENDING})` : ""}`}
                    </button>
                ))}
            </div>

            {error ? (
                <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    <button onClick={refresh} className="mt-3 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-800 dark:border-red-800 dark:text-red-200">Try again</button>
                </section>
            ) : loading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle size={20} className="animate-spin" /> Loading applications…</div>
            ) : requests.length ? (
                <section className="grid gap-3 lg:grid-cols-2">
                    {requests.map(request => {
                        const pending = request.status === "PENDING";
                        const updating = updatingId === request.request_id;
                        return (
                            <article key={request.request_id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="wrap-break-words text-lg font-semibold text-gray-900 dark:text-white">{request.full_name}</h2>
                                        <a href={`mailto:${request.email}`} className="mt-1 block break-all text-sm text-blue-800 hover:underline dark:text-blue-300">{request.email}</a>
                                        <a href={`tel:${request.phone_number}`} className="mt-1 block text-sm text-slate-600 hover:underline dark:text-slate-300">{request.phone_number}</a>
                                        <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">Enrollment: <span className="font-semibold">{request.enrollment_number || "Missing"}</span></p>
                                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Batch {request.admission_year || "Missing"} · Section {request.section_name || "Missing"}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[request.status] || "bg-slate-100 text-slate-700"}`}>{request.status}</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> Applied {dateLabel(request.submitted_at)}</span>
                                    {request.reviewed_at && <span>Reviewed {dateLabel(request.reviewed_at)}</span>}
                                </div>
                                {pending && <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 dark:border-gray-800">
                                    <button type="button" disabled={updating} onClick={() => review(request, "REJECTED")} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40">
                                        {updating ? <LoaderCircle size={15} className="animate-spin" /> : <X size={15} />} Reject
                                    </button>
                                    <button type="button" disabled={updating || !request.enrollment_number || !request.batch_id || !request.section_id} onClick={() => review(request, "APPROVED")} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
                                        {updating ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />} Approve
                                    </button>
                                </div>}
                            </article>
                        );
                    })}
                </section>
            ) : (
                <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-gray-700 dark:bg-gray-900">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">{status === "REJECTED" ? <UserRoundX size={22} /> : <GraduationCap size={22} />}</span>
                    <h2 className="mt-3 font-semibold text-gray-900 dark:text-white">No {status === "ALL" ? "student" : status.toLowerCase()} applications</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Applications will appear here when students submit the public form.</p>
                </section>
            )}
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Approving an application creates the login account and student record using the submitted enrollment, batch, and section details. The student can change the default password after signing in.</p>
        </main>
    );
}
