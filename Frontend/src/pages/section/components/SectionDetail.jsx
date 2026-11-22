import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, GraduationCap, RefreshCw } from "lucide-react";
import StudentTable from "../../students/components/StudentTable";
import { attendanceRequest } from "../../attendance/components/useAttendance";
import { marksRequest } from "../../marks/components/useMarks";

const tabs = [
    { id: "students", label: "Students" },
    { id: "attendance", label: "Attendance" },
    { id: "exams", label: "Exams & Marks" }
];

const SectionDetail = ({ section, onBack }) => {
    const [activeTab, setActiveTab] = useState("students");
    const [data, setData] = useState({ students: null, attendance: null, exams: null, marks: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTab = useCallback(async (tab, force = false) => {
        if (!force && data[tab] !== null && (tab !== "exams" || data.marks !== null)) return;
        setLoading(true);
        setError("");
        try {
            if (tab === "students") {
                const response = await fetch(`${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api/coordinators/my-sections/${encodeURIComponent(section.section_id)}/${encodeURIComponent(section.batch_id)}/students`, { credentials: "include" });
                const result = await response.json();
                if (!response.ok || result.success === false) throw new Error(result.message || "Unable to load students for this section.");
                setData(current => ({ ...current, students: Array.isArray(result.data) ? result.data : [] }));
            } else if (tab === "attendance") {
                const query = new URLSearchParams({ sectionId: section.section_id, batchId: section.batch_id });
                const result = await attendanceRequest(`/api/attendance/report?${query}`);
                const rows = (result.data || []).filter(item => Number(item.section?.sectionId) === Number(section.section_id) && Number(item.batch?.batchId) === Number(section.batch_id));
                setData(current => ({ ...current, attendance: rows }));
            } else {
                const query = new URLSearchParams({ sectionId: section.section_id, batchId: section.batch_id });
                const [examsResult, marksResult] = await Promise.all([
                    marksRequest("/api/marks/exams"),
                    marksRequest(`/api/marks?${query}`)
                ]);
                const exams = (examsResult.data || []).filter(item => Number(item.batch_id) === Number(section.batch_id));
                setData(current => ({ ...current, exams, marks: marksResult.data || [] }));
            }
        } catch (requestError) {
            setError(requestError.message || "Unable to load section details.");
        } finally {
            setLoading(false);
        }
    }, [data, section]);

    useEffect(() => {
        const timer = setTimeout(() => loadTab(activeTab), 0);
        return () => clearTimeout(timer);
    }, [activeTab, loadTab]);

    const selectTab = tab => {
        setActiveTab(tab);
    };

    const admissionYear = Number(section.admission_year);
    const sectionRow = { section_id: section.section_id, batch_id: section.batch_id, section_name: section.section_name, admission_year: section.admission_year };
    const batchRow = { batch_id: section.batch_id, admission_year: section.admission_year };

    return <div className="space-y-5">
        <header className="flex flex-wrap items-center gap-3"><button type="button" onClick={onBack} aria-label="Back to my sections" className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"><ArrowLeft size={18}/></button><div className="flex min-w-0 items-center gap-3"><span className="rounded-xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"><GraduationCap size={23}/></span><div><h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Section {section.section_name}</h1><p className="text-sm text-gray-500 dark:text-gray-400">Batch {section.admission_year}–{admissionYear + 4}{section.current_semester ? ` · Semester ${section.current_semester}` : ""}</p></div></div></header>

        <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700" role="tablist" aria-label="Section dashboard">{tabs.map(({ id, label }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => selectTab(id)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${activeTab === id ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-300" : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"}`}>{label}</button>)}</nav>

        {loading ? <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-gray-500"><RefreshCw size={18} className="animate-spin text-blue-700"/>Loading {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()}...</div> : error ? <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><p>{error}</p><button type="button" onClick={() => loadTab(activeTab, true)} className="mt-3 font-semibold underline">Try again</button></div> : activeTab === "students" ? <section className="space-y-3"><div><h2 className="text-lg font-semibold text-gray-800 dark:text-white">Students</h2><p className="text-sm text-gray-500 dark:text-gray-400">Students assigned to Section {section.section_name} in Batch {section.admission_year}.</p></div><StudentTable students={data.students || []} sections={[sectionRow]} batches={[batchRow]} canManage={false} canManageStudent={() => false}/></section> : activeTab === "attendance" ? <section className="space-y-3"><div><h2 className="text-lg font-semibold text-gray-800 dark:text-white">Attendance</h2><p className="text-sm text-gray-500 dark:text-gray-400">Attendance reports for this section and batch.</p></div>{data.attendance?.length ? <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400"><tr>{["Subject", "Category", "Type", "Sessions", "Submitted", "Attendance"].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{data.attendance.map((item, index) => <tr key={`${item.subject.subjectId}-${item.attendanceCategory}-${item.sessionType}-${index}`} className="border-t border-gray-100 dark:border-gray-700"><td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.subject.subjectCode} · {item.subject.subjectName}</td><td className="px-4 py-3">{item.attendanceCategory}</td><td className="px-4 py-3">{item.sessionType}</td><td className="px-4 py-3">{item.totalSessions}</td><td className="px-4 py-3">{item.totalSubmissions} / {item.expectedAttendance}</td><td className="px-4 py-3 font-semibold">{item.attendancePercentage}%</td></tr>)}</tbody></table></div> : <EmptyState>There are no attendance reports for this section yet.</EmptyState>}</section> : <section className="space-y-6"><div><h2 className="text-lg font-semibold text-gray-800 dark:text-white">Exams & Marks</h2><p className="text-sm text-gray-500 dark:text-gray-400">Exam results are limited to this section and batch.</p></div><div className="space-y-3"><h3 className="font-semibold text-gray-800 dark:text-white">Exams</h3>{data.exams?.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.exams.map(exam => <article key={exam.exam_id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"><h4 className="font-semibold text-gray-900 dark:text-white">{exam.exam_name}</h4><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Semester {exam.semester} · {exam.academic_year}</p><p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{(exam.subjects || []).map(subject => `${subject.subject_code} · ${subject.max_marks} marks`).join(" / ")}</p></article>)}</div> : <EmptyState>No exams are available for this batch.</EmptyState>}</div><div className="space-y-3"><h3 className="font-semibold text-gray-800 dark:text-white">Marks</h3>{data.marks?.length ? <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400"><tr>{["Student", "Exam", "Subject", "Marks", "Status"].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{data.marks.map((item, index) => <tr key={item.mark_id || `${item.exam_id}-${item.subject_id}-${item.student_id}-${index}`} className="border-t border-gray-100 dark:border-gray-700"><td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.student_name} · {item.enrollment_number}</td><td className="px-4 py-3">{item.exam_name}</td><td className="px-4 py-3">{item.subject_code} · {item.subject_name}</td><td className="px-4 py-3">{item.marks_obtained ?? "—"} / {item.max_marks}</td><td className="px-4 py-3">{item.result_status || item.attendance_status || "—"}</td></tr>)}</tbody></table></div> : <EmptyState>No marks are available for this section yet.</EmptyState>}</div></section>}
    </div>;
};

function EmptyState({ children }) {
    return <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">{children}</div>;
}

export default SectionDetail;
