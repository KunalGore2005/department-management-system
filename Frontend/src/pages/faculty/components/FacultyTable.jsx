import React from 'react';
import { Mail, Phone, GraduationCap, Users } from 'lucide-react';

const FacultyTable = ({ faculty, onEdit, onToggleStatus, updatingFacultyId }) => {

    if (!faculty || faculty.length === 0) {
        return (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl py-12 text-center">
                <Users
                    size={36}
                    className="mx-auto text-gray-400 mb-3"
                />
                <h3 className="text-base font-medium text-gray-800 dark:text-white">
                    No faculty found
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Try changing your search or filter criteria.
                </p>
            </div>
        );
    }

    const formatBatch = (year) => {
        return year ? `${year}-${year + 4}` : 'N/A';
    };

    const getUniqueAssignments = (assignments, type) => {
        const unique = new Map();

        assignments.forEach((assignment) => {
            const key = type === 'teaching'
                ? `${assignment.batch_id}-${assignment.section_id}-${assignment.subject_id}`
                : `${assignment.batch_id}-${assignment.section_id}`;

            if (!unique.has(key)) {
                unique.set(key, assignment);
            }
        });

        return Array.from(unique.values());
    };

    return (
        <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">

            <table className="w-full min-w-262.5 text-sm text-left">

                {/* Table Header */}
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase">
                    <tr>
                        <th className="px-5 py-4 font-medium">
                            Faculty
                        </th>

                        <th className="px-5 py-4 font-medium">
                            Contact
                        </th>

                        <th className="px-5 py-4 font-medium">
                            Teaching Assignments
                        </th>

                        <th className="px-5 py-4 font-medium">
                            Coordinator Of
                        </th>

                        <th className="px-5 py-4 font-medium">
                            Status
                        </th>

                        {(onEdit || onToggleStatus) && (
                            <th className="px-5 py-4 font-medium text-right">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                    {faculty.map((member) => {
                        const teachingAssignments = getUniqueAssignments(
                            member.teachingAssignments || [],
                            'teaching'
                        );

                        const coordinatorAssignments = getUniqueAssignments(
                            member.coordinatorAssignments || [],
                            'coordinator'
                        );

                        const isActive = Boolean(Number(member.is_active));

                        return (
                            <tr
                                key={member.faculty_id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >

                                {/* Faculty Details */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold shrink-0">
                                            {member.name?.charAt(0)?.toUpperCase() || 'F'}
                                        </div>

                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {member.name}
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                {member.designation || 'Designation not specified'}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Contact Details */}
                                <td className="px-5 py-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <Mail size={14} className="text-gray-400 shrink-0" />
                                            <span>{member.email}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                                            <Phone size={13} className="text-gray-400 shrink-0" />
                                            <span>{member.phone || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Teaching Assignments */}
                                <td className="px-5 py-4">
                                    {teachingAssignments.length > 0 ? (
                                        <div className="space-y-2">
                                            {teachingAssignments.map((assignment) => (
                                                <div
                                                    key={assignment.allocation_id}
                                                    className="flex flex-col gap-1"
                                                >
                                                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                                                        {assignment.subject_code || assignment.subject_name}
                                                    </span>

                                                    <span className="text-xs text-gray-500">
                                                        {formatBatch(assignment.admission_year)}
                                                        {' · Section '}
                                                        {assignment.section_name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">
                                            No teaching assignments
                                        </span>
                                    )}
                                </td>

                                {/* Coordinator Assignments */}
                                <td className="px-5 py-4">
                                    {coordinatorAssignments.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {coordinatorAssignments.map((assignment) => (
                                                <span
                                                    key={assignment.assignment_id}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
                                                >
                                                    {formatBatch(assignment.admission_year)}
                                                    {' · '}
                                                    {assignment.section_name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">
                                            Not a coordinator
                                        </span>
                                    )}
                                </td>

                                {/* Account Status */}
                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'
                                                }`}
                                        />
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>

                                {/* Actions */}

                                {/* Actions */}
                                {(onEdit || onToggleStatus) && (
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(member)}
                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-medium"
                                                >
                                                    Edit
                                                </button>
                                            )}

                                            {onToggleStatus && (
                                                <button
                                                    onClick={() => onToggleStatus(member)}
                                                    disabled={updatingFacultyId === member.user_id}
                                                    className={`text-xs font-medium disabled:opacity-50 ${isActive
                                                        ? 'text-red-600 hover:text-red-700'
                                                        : 'text-green-600 hover:text-green-700'
                                                        }`}
                                                >
                                                    {updatingFacultyId === member.user_id
                                                        ? 'Updating...'
                                                        : isActive
                                                            ? 'Deactivate'
                                                            : 'Activate'}
                                                </button>
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

export default FacultyTable;