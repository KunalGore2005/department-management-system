import { Mail, Phone, GraduationCap, Users } from 'lucide-react';

const active = (value) => value === true || Number(value) === 1;

const StudentTable = ({ students, sections, batches, canManage, canManageStudent, onEdit, onToggleStatus, updatingId }) => {
    if (!students.length) {
        return (
            <div className="rounded-xl border border-gray-200 py-12 text-center dark:border-gray-700">
                <Users size={36} className="mx-auto mb-3 text-gray-400" />
                <h3 className="text-base font-medium text-gray-800 dark:text-white">No students found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Try another search or choose a different section.
                </p>
            </div>
        );
    }
    const sectionFor = (student) => sections.find((item) => Number(item.section_id) === Number(student.section_id) && Number(item.batch_id) === Number(student.batch_id));
    const batchFor = (student) => batches.find((item) => Number(item.batch_id) === Number(student.batch_id));
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-225 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
                    <tr>
                        <th className="px-5 py-4 font-medium">Student</th>
                        <th className="px-5 py-4 font-medium">Enrollment</th>
                        <th className="px-5 py-4 font-medium">Contact</th>
                        <th className="px-5 py-4 font-medium">Batch / Section</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        {canManage && <th className="px-5 py-4 text-right font-medium">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student) => {
                        const isActive = active(student.is_active);
                        const section = sectionFor(student);
                        const batch = batchFor(student);
                        const manageable = canManageStudent(student);

                        return (
                            <tr key={student.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                            {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                            <p className="mt-1 text-xs text-gray-500">ID {student.user_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                                    {student.enrollment_number || '—'}
                                </td>
                                <td className="px-5 py-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <Mail size={14} className="shrink-0 text-gray-400" />
                                            {student.email || '—'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Phone size={13} className="shrink-0 text-gray-400" />
                                            {student.phone || 'Not provided'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        <GraduationCap size={14} />
                                        {batch?.admission_year ?? section?.admission_year ?? 'Batch'} · {section?.section_name || 'Section'}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                            isActive
                                                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                isActive ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                        />
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                {canManage && (
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            {manageable ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit(student)}
                                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onToggleStatus(student)}
                                                        disabled={updatingId === student.user_id}
                                                        className={`text-xs font-medium disabled:opacity-50 ${
                                                            isActive
                                                                ? 'text-red-600 hover:text-red-700'
                                                                : 'text-green-600 hover:text-green-700'
                                                        }`}
                                                    >
                                                        {updatingId === student.user_id
                                                            ? 'Updating...'
                                                            : isActive
                                                              ? 'Deactivate'
                                                              : 'Activate'}
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400">Read only</span>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default StudentTable;
