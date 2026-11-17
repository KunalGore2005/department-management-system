import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Check, Clock3, History, Play, RefreshCw, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { attendanceRequest, useAttendanceData } from "./useAttendance";

const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800";
const label = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-200";
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900";
const formatDate = value => value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function AttendanceManagement({ isHod = false }) {
    const { active, history, reports, allocations, loading, refresh, setActive } = useAttendanceData(isHod ? "HOD" : "FACULTY");
    const [live, setLive] = useState(null);
    const [tab, setTab] = useState("session");
    const [starting, setStarting] = useState(false);
    const [ending, setEnding] = useState(false);
    const [confirmEnd, setConfirmEnd] = useState(false);
    const [form, setForm] = useState({ subjectId: "", sessionType: "THEORY", attendanceCategory: "REGULAR", attendanceMethod: "UNIQUE_ID", presentStrength: "", durationMinutes: 10, sections: [] });

    const subjectOptions = useMemo(() => {
        const map = new Map();
        allocations.forEach(item => {
            if (!map.has(item.subject_id)) map.set(item.subject_id, { id: item.subject_id, code: item.subject_code, name: item.subject_name });
        });
        return [...map.values()];
    }, [allocations]);
    const sectionOptions = allocations.filter(item => String(item.subject_id) === String(form.subjectId));
    const activeSessions = isHod ? history.filter(item => item.status === "ACTIVE" && new Date(item.endTime) > new Date()) : [];

    const loadLive = useCallback(async () => {
        if (!active?.sessionId) return;
        try {
            const result = await attendanceRequest(`/api/attendance/session/${active.sessionId}/live`);
            setLive(result.data);
        } catch (error) { toast.error(error.message); }
    }, [active]);
    useEffect(() => {
        if (active?.sessionId) {
            const initial = setTimeout(() => { loadLive(); }, 0);
            const timer = setInterval(() => { loadLive(); }, 6000);
            return () => { clearTimeout(initial); clearInterval(timer); };
        }
    }, [active?.sessionId, loadLive]);

    const startSession = async event => {
        event.preventDefault();
        if (!form.subjectId || !form.sections.length || !form.presentStrength || !form.durationMinutes) return toast.error("Complete all required session details.");
        setStarting(true);
        try {
            const result = await attendanceRequest("/api/attendance/start-session", { method: "POST", body: JSON.stringify({ subjectId: Number(form.subjectId), sessionType: form.sessionType, attendanceCategory: form.attendanceCategory, attendanceMethod: form.attendanceMethod, presentStrength: Number(form.presentStrength), durationMinutes: Number(form.durationMinutes), sections: form.sections.map(key => { const [sectionId, batchId] = key.split(":"); return { sectionId: Number(sectionId), batchId: Number(batchId) }; }) }) });
            const started = result.data;
            const chosen = allocations.filter(item => form.sections.includes(`${item.section_id}:${item.batch_id}`));
            setActive({ ...started, subject: subjectOptions.find(item => String(item.id) === String(form.subjectId)), sections: chosen.map(item => ({ sectionId: item.section_id, sectionName: item.section_name, batchId: item.batch_id, admissionYear: item.admission_year })), status: "ACTIVE" });
            toast.success("Attendance session started.");
            await refresh(true);
        } catch (error) { toast.error(error.message); }
        finally { setStarting(false); }
    };
    const endSession = async () => {
        setEnding(true);
        try {
            const result = await attendanceRequest("/api/attendance/end-session", { method: "POST", body: JSON.stringify({ sessionId: active.sessionId }) });
            toast.success(`Session ended · ${result.data.markedCount} submitted · ${result.data.absentCount} remaining.`);
            setConfirmEnd(false); setActive(null); await refresh();
        } catch (error) { toast.error(error.message); }
        finally { setEnding(false); }
    };
    const duplicateIds = new Set((live?.students || []).filter(student => live.students.filter(other => String(other.uniqueId) === String(student.uniqueId)).length > 1).map(student => String(student.uniqueId)));

    const tabs = [{ id: "session", name: "Live session" }, { id: "history", name: "History" }, { id: "reports", name: "Reports" }];
    return <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wide text-blue-900">Attendance</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{isHod ? "Department attendance" : "My attendance sessions"}</h1><p className="mt-1 text-sm text-slate-500">Start sessions, monitor submissions, and review attendance activity.</p></div><button onClick={() => refresh()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-gray-600"><RefreshCw size={16}/> Refresh</button></header>
        <nav className="flex gap-2 border-b border-slate-200 dark:border-gray-700">{tabs.map(({ id, name }) => <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold ${tab === id ? "border-blue-900 text-blue-900 dark:text-blue-300" : "border-transparent text-slate-500"}`}>{name}</button>)}</nav>
        {isHod && tab === "session" && activeSessions.length > 1 && <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"><span className="mr-1 text-sm font-semibold">Department active sessions:</span>{activeSessions.map(session => <button key={session.sessionId} onClick={async () => { try { const result = await attendanceRequest(`/api/attendance/session/${session.sessionId}`); setActive(result.data); } catch (error) { toast.error(error.message); } }} className={`rounded-lg border px-3 py-2 text-sm ${Number(active?.sessionId) === Number(session.sessionId) ? "border-blue-900 bg-blue-50 text-blue-900" : "border-slate-300 dark:border-gray-600"}`}>{session.subject.subjectCode} · {(session.sections || []).map(section => section.sectionName).join(", ")} · {session.sessionCode}</button>)}</div>}
        {loading ? <div className="py-16 text-center text-sm text-slate-500">Loading attendance…</div> : tab === "session" ? <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            {!active ? <form onSubmit={startSession} className={`${card} space-y-4`}><div><h2 className="text-lg font-bold">Start a session</h2><p className="mt-1 text-sm text-slate-500">Select an allocated subject and its sections.</p></div>
                <div><label className={label}>Subject</label><select className={input} value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value, sections: [] })} required><option value="">Choose subject</option>{subjectOptions.map(item => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></div>
                <div><label className={label}>Sections and batches</label><div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-gray-700">{sectionOptions.length ? sectionOptions.map(item => { const key = `${item.section_id}:${item.batch_id}`; return <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.sections.includes(key)} onChange={e => setForm({ ...form, sections: e.target.checked ? [...form.sections, key] : form.sections.filter(value => value !== key) })}/><span>Section {item.section_name} · Batch {item.admission_year}</span></label>; }) : <span className="text-sm text-slate-500">Choose a subject to see allocated sections.</span>}</div></div>
                <div className="grid grid-cols-2 gap-3"><div><label className={label}>Session type</label><select className={input} value={form.sessionType} onChange={e => setForm({ ...form, sessionType: e.target.value })}><option>THEORY</option><option>LAB</option></select></div><div><label className={label}>Attendance category</label><select className={input} value={form.attendanceCategory} onChange={e => setForm({ ...form, attendanceCategory: e.target.value })}><option value="REGULAR">REGULAR</option></select></div></div>
                <div className="grid grid-cols-2 gap-3"><div><label className={label}>Attendance method</label><select className={input} value={form.attendanceMethod} onChange={e => setForm({ ...form, attendanceMethod: e.target.value })}><option value="UNIQUE_ID">UNIQUE_ID</option></select></div><div><label className={label}>Present strength</label><input className={input} type="number" min="1" value={form.presentStrength} onChange={e => setForm({ ...form, presentStrength: e.target.value })} required/></div></div>
                <div><label className={label}>Duration (minutes)</label><input className={input} type="number" min="1" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} required/></div>
                <button disabled={starting} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-4 py-2.5 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"><Play size={16}/>{starting ? "Starting…" : "Start attendance"}</button>
            </form> : <section className={`${card} lg:col-span-2`}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">● SESSION ACTIVE</p><h2 className="mt-1 text-xl font-bold">{active.subject?.subjectCode} · {active.subject?.subjectName}</h2><p className="mt-1 text-sm text-slate-500">{(active.sections || []).map(section => `Section ${section.sectionName} · ${section.admissionYear}`).join(" / ")} · {active.sessionType}</p></div><div className="flex gap-2"><div className="rounded-lg bg-blue-50 px-4 py-2 text-center dark:bg-blue-950"><span className="block text-xs text-slate-500">Session code</span><strong className="font-mono text-2xl tracking-[0.2em] text-blue-950 dark:text-white">{active.sessionCode}</strong></div><button onClick={() => setConfirmEnd(true)} className="inline-flex h-fit items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"><StopCircle size={16}/> End session</button></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric title="Expected" value={live?.presentStrength ?? active.presentStrength}/><Metric title="Submitted" value={live?.markedCount ?? 0}/><Metric title="Remaining" value={live?.remainingCount ?? active.presentStrength}/></div><div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><Clock3 size={16}/> Started {formatDate(active.startTime)} · Ends {formatDate(active.endTime)}</div><div className="mt-5 overflow-x-auto"><h3 className="mb-3 font-semibold">Live submissions</h3>{live?.students?.length ? <table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-gray-900"><tr>{["Student", "Enrollment", "Section / batch", "Unique number", "Submitted"].map(x => <th key={x} className="px-3 py-3">{x}</th>)}</tr></thead><tbody>{live.students.map(student => <tr key={student.submissionId} className={`border-b border-slate-100 dark:border-gray-700 ${duplicateIds.has(String(student.uniqueId)) ? "bg-red-50 dark:bg-red-950/30" : ""}`}><td className="px-3 py-3 font-medium">{student.name}</td><td className="px-3 py-3">{student.enrollmentNumber}</td><td className="px-3 py-3">{student.section.sectionName} · {student.batch.admissionYear}</td><td className="px-3 py-3 font-mono">{student.uniqueId} {duplicateIds.has(String(student.uniqueId)) && <span title="Duplicate unique number" className="ml-1 inline-flex items-center gap-1 font-sans text-xs font-semibold text-red-700"><AlertTriangle size={13}/> Duplicate</span>}</td><td className="px-3 py-3">{formatDate(student.submittedAt)}</td></tr>)}</tbody></table> : <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-gray-900">No students have submitted yet. This list updates automatically.</p>}</div></section>}
        </div> : tab === "history" ? <section className={card}><h2 className="mb-4 text-lg font-bold">Session history</h2>{history.length ? <div className="overflow-x-auto"><table className="w-full min-w-[750px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-gray-900"><tr>{["Date", "Subject", "Sections / batches", "Type / category", "Expected", "Submitted", "Status", "Details"].map(x => <th key={x} className="px-3 py-3">{x}</th>)}</tr></thead><tbody>{history.map((item,index) => <tr key={item.sessionId || index} className="border-b border-slate-100 dark:border-gray-700"><td className="px-3 py-3">{formatDate(item.startTime)}</td><td className="px-3 py-3">{item.subject?.subjectCode} · {item.subject?.subjectName}</td><td className="px-3 py-3">{(item.sections || []).map(section => `${section.sectionName} · ${section.admissionYear}`).join(", ") || "—"}</td><td className="px-3 py-3">{item.sessionType} · {item.attendanceCategory}</td><td className="px-3 py-3">{item.presentStrength ?? "—"}</td><td className="px-3 py-3">{item.markedCount ?? "—"}</td><td className="px-3 py-3">{item.status}</td><td className="px-3 py-3"><button onClick={async () => { try { const result = await attendanceRequest(`/api/attendance/session/${item.sessionId}`); const session = result.data; toast.info(`${session.faculty?.facultyName || "Faculty"} · ${session.sections.map(section => `${section.sectionName} (${section.admissionYear})`).join(", ")} · ${session.sessionCode}`); } catch (error) { toast.error(error.message); } }} className="font-semibold text-blue-900">Inspect</button></td></tr>)}</tbody></table></div> : <p className="py-12 text-center text-sm text-slate-500">No attendance history is available.</p>}</section> : <section className={card}><h2 className="mb-4 text-lg font-bold">Attendance reports</h2>{reports.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-gray-900"><tr>{["Subject", "Section", "Batch", "Category", "Sessions", "Expected", "Submitted", "Attendance"].map(x => <th key={x} className="px-3 py-3">{x}</th>)}</tr></thead><tbody>{reports.map((item,index)=><tr key={index} className="border-b border-slate-100 dark:border-gray-700"><td className="px-3 py-3">{item.subject.subjectCode} · {item.subject.subjectName}</td><td className="px-3 py-3">{item.section.sectionName}</td><td className="px-3 py-3">{item.batch.admissionYear}</td><td className="px-3 py-3">{item.attendanceCategory} · {item.sessionType}</td><td className="px-3 py-3">{item.totalSessions}</td><td className="px-3 py-3">{item.expectedAttendance}</td><td className="px-3 py-3">{item.totalSubmissions}</td><td className="px-3 py-3 font-semibold">{item.attendancePercentage}%</td></tr>)}</tbody></table></div>:<p className="py-12 text-center text-sm text-slate-500">No report data is available.</p>}</section>}
        {confirmEnd && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className={`${card} w-full max-w-md`}><h2 className="text-lg font-bold">End this session?</h2><p className="mt-2 text-sm text-slate-600">Students will no longer be able to submit attendance after the session ends.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setConfirmEnd(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button onClick={endSession} disabled={ending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">{ending ? "Ending…" : "End session"}</button></div></div></div>}
    </div>;
}

function Metric({ title, value }) { return <div className="rounded-lg bg-slate-50 p-4 dark:bg-gray-900"><p className="text-sm text-slate-500">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>; }
