import { BookOpenCheck, CalendarDays } from "lucide-react";
import useMarks from "./components/useMarks";

export default function Student() {
    const { marks, exams, loading } = useMarks();
    const groups = exams.map(exam => ({ exam, subjects: (exam.subjects || []).map(subject => {
        const result = marks.find(mark => Number(mark.exam_id) === Number(exam.exam_id) && Number(mark.subject_id) === Number(subject.subject_id));
        return { ...subject, result };
    }) }));
    const card = "overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800";
    return (
        <main className="min-h-full space-y-5 p-4 md:p-6">
            <header className="flex items-center gap-3">
                <span className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                    <BookOpenCheck size={23} />
                </span>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Marks</h1>
                    <p className="mt-1 text-sm text-slate-500">Exam results for your batch.</p>
                </div>
            </header>
            {loading ? (
                <div className="py-14 text-center text-sm text-slate-500">Loading results…</div>
            ) : groups.length ? (
                <div className="space-y-4">
                    {groups.map(({ exam, subjects }) => (
                        <section key={exam.exam_id} className={card}>
                            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-gray-700">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {exam.exam_name}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Semester {exam.semester} · {exam.academic_year}
                                    </p>
                                </div>
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                                    <CalendarDays className="mr-1 inline" size={14} />
                                    {exam.admission_year}
                                </span>
                            </header>
                            <ul className="divide-y divide-slate-100 px-5 dark:divide-gray-700">
                                {subjects.map(subject => {
                                    const status =
                                        subject.result?.result_status ||
                                        (subject.result?.attendance_status || "PENDING");

                                    return (
                                        <li
                                            key={subject.subject_id}
                                            className="flex flex-wrap items-center justify-between gap-3 py-4"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {subject.subject_code} · {subject.subject_name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Maximum {subject.max_marks} marks
                                                </p>
                                            </div>
                                            {status === "PRESENT" ? (
                                                <strong className="text-lg text-gray-900 dark:text-white">
                                                    {subject.result.marks_obtained} / {subject.max_marks}
                                                </strong>
                                            ) : status === "ABSENT" ? (
                                                <span className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                                    Absent
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                                    Pending / Not Uploaded
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            ) : (
                <section className={`${card} py-14 text-center text-sm text-slate-500`}>
                    No exams have been configured for your batch.
                </section>
            )}
        </main>
    );
}
