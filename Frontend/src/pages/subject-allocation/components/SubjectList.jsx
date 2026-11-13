import { useState } from "react";
import { BookOpen, UserRound, UserPlus, Pencil, Trash2 } from "lucide-react";
import AssignFaculty from "./AssignFaculty";

const SubjectList = ({
    subjects,
    allocations,
    faculty,
    onAssign,
    onUpdate,
    onRemove,
    updating
}) => {
    const [activeSubject, setActiveSubject] = useState(null);

    const getAllocation = (subjectId) => {
        return allocations.find(
            (allocation) =>
                Number(allocation.subject_id) === Number(subjectId)
        );
    };

    const handleSave = async (facultyId) => {
        const allocation = getAllocation(activeSubject.subject_id);

        if (allocation) {
            await onUpdate(allocation.allocation_id, {
                facultyId,
                subjectId: activeSubject.subject_id
            });
        } else {
            await onAssign({
                facultyId,
                subjectId: activeSubject.subject_id
            });
        }

        setActiveSubject(null);
    };

    const handleRemove = async (allocationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this faculty assignment?"
        );

        if (!confirmed) return;

        await onRemove(allocationId);
    };

    if (!subjects.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <BookOpen className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-600 font-medium">
                    No subjects found for this semester.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden dark:bg-gray-800 dark:border-gray-700">

            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Subject Allocation
                </h2>
                <p className="text-sm text-gray-500 mt-1 dark:text-white">
                    Assign faculty members to subjects.
                </p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {subjects.map((subject) => {
                    const allocation = getAllocation(subject.subject_id);

                    return (
                        <div
                            key={subject.subject_id}
                            className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                        >
                            {/* Subject Details */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <BookOpen size={20} />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white">
                                        {subject.subject_name}
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                                        {subject.subject_code}
                                    </p>
                                </div>
                            </div>

                            {/* Faculty Details and Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                                {allocation ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <UserRound size={17} className="text-green-600" />
                                        <span className="dark:text-white">{allocation.faculty_name}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-amber-600">
                                        Not assigned
                                    </span>
                                )}

                                {allocation && (
                                    <button
                                        onClick={() => handleRemove(allocation.allocation_id)}
                                        disabled={updating}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                        title="Remove assignment"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                )}

                                <button
                                    onClick={() => setActiveSubject(subject)}
                                    disabled={updating}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {allocation ? (
                                        <>
                                            <Pencil size={15} />
                                            Change Faculty
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={15} />
                                            Assign Faculty
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeSubject && (
                <AssignFaculty
                    subject={activeSubject}
                    faculty={faculty}
                    currentFacultyId={
                        getAllocation(activeSubject.subject_id)?.faculty_id
                    }
                    onClose={() => setActiveSubject(null)}
                    onSave={handleSave}
                    updating={updating}
                />
            )}
        </div>
    );
};

export default SubjectList;