import { useEffect, useState } from "react";
import { School } from "lucide-react";
import { toast } from "sonner";
import { marksRequest } from "../marks/components/useMarks";

export default function Faculty() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { marksRequest("/api/marks/exams").then(result => setExams(result.data || [])).catch(error => toast.error(error.message)).finally(() => setLoading(false)); }, []);
    return <main className="min-h-full space-y-5 p-4 md:p-6">
        <header className="flex items-center gap-3">
            <span className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                <School size={23} />
            </span>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Exams
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    View the exams configured for each batch.
                </p>
            </div>
        </header>
        <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full min-w-170 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-gray-900">
                    <tr>
                        {["Exam", "Batch", "Semester", "Academic year", "Subjects"].map(item => <th key={item} 
                        className="px-4 py-3">
                            {item}
                        </th>)}
                    </tr>
                </thead>
                <tbody>
                    {
                    loading ? <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-500">Loading exams…</td>
                        </tr> : exams.length ? exams.map(exam => <tr key={exam.exam_id} className="border-b border-slate-100 last:border-0 dark:border-gray-700">
                        <td className="px-4 py-4 font-semibold">{exam.exam_name}</td><td className="px-4 py-4">{exam.admission_year}</td>
                        <td className="px-4 py-4">{exam.semester}</td><td className="px-4 py-4">{exam.academic_year}</td>
                        <td className="px-4 py-4">{exam.subjects.map(item => `${item.subject_code} (${item.max_marks})`).join(", ")}</td>
                    </tr>) : <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-500">No exams have been created.</td>
                        </tr>}
                    </tbody>
                </table>
            </section>
        </main>;
}
