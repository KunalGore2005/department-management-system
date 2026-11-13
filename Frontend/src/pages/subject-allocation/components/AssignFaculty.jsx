import { useEffect, useState } from "react";
import { X, UserRound, Check } from "lucide-react";

const AssignFaculty = ({
    subject,
    faculty,
    currentFacultyId,
    onClose,
    onSave,
    updating
}) => {
    const [selectedFaculty, setSelectedFaculty] = useState(
        currentFacultyId ? String(currentFacultyId) : ""
    );

    useEffect(() => {
        setSelectedFaculty(
            currentFacultyId ? String(currentFacultyId) : ""
        );
    }, [currentFacultyId]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedFaculty) return;

        onSave(Number(selectedFaculty));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 ">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Assign Faculty
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {subject.subject_code} - {subject.subject_name}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                        disabled={updating}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                            Select Faculty
                        </label>

                        <select
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            required
                        >
                            <option value="" className="dark:text-white dark:bg-gray-800">Choose faculty member</option>

                            {faculty.map((member) => (
                                <option
                                    key={member.faculty_id}
                                    value={member.faculty_id}
                                    className="dark:text-white dark:bg-gray-800"
                                >
                                    {member.name}
                                </option>
                            ))}
                        </select>

                        {faculty.length === 0 && (
                            <p className="text-sm text-red-500 mt-2">
                                No faculty members available.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={updating}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!selectedFaculty || updating}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            <Check size={16} />
                            {updating ? "Saving..." : "Save Assignment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignFaculty;