export default function MarksTable({ marks, loading, onEdit, onDelete }) {
    if (loading) {
        return <div className="py-12 text-center text-sm text-slate-500">Loading marks…</div>;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700">
            <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-gray-900">
                    <tr>
                        {["Student", "Exam", "Subject", "Batch / Section", "Marks", "Academic year", ""].map(
                            item => <th key={item} className="px-4 py-3">{item}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {marks.length ? (
                        marks.map(row => (
                            <tr key={row.mark_id} className="border-b border-slate-100 last:border-0 dark:border-gray-700">
                                <td className="px-4 py-3">
                                    <strong>{row.student_name}</strong>
                                    <span className="block text-xs text-slate-500">{row.enrollment_number}</span>
                                </td>
                                <td className="px-4 py-3">
                                    {row.exam_name}
                                    <span className="block text-xs text-slate-500">Semester {row.semester}</span>
                                </td>
                                <td className="px-4 py-3">{row.subject_code} · {row.subject_name}</td>
                                <td className="px-4 py-3">{row.admission_year} · {row.section_name}</td>
                                <td className="px-4 py-3 font-semibold">
                                    {row.marks_obtained} / {row.max_marks}
                                </td>
                                <td className="px-4 py-3">{row.academic_year}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-3">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(row)}
                                                className="font-semibold text-blue-900 hover:underline"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(row)}
                                                className="font-semibold text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                                No marks found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
