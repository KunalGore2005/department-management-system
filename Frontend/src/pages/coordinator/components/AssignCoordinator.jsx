
import React, { useState } from 'react';
import {
    X,
    UserRound,
    AlertTriangle,
    ShieldCheck,
    ArrowLeft,
    LoaderCircle,
    Users,
    CalendarDays
} from 'lucide-react';

const AssignCoordinator = ({
    section,
    availableFaculties,
    assignedFaculties,
    updating,
    onAssign,
    onClose
}) => {

    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [confirmationStep, setConfirmationStep] = useState(false);
    const [typedName, setTypedName] = useState('');

    const currentCoordinator = section.coordinator;

    const allFaculties = [
        ...availableFaculties,
        ...assignedFaculties
    ];

    const selectedFaculty = allFaculties.find(
        faculty =>
            String(faculty.faculty_id) === selectedFacultyId
    );

    const alreadyAssigned = selectedFaculty
        ? selectedFaculty.assignmentCount > 0
        : false;

    const hasFacultyIds = allFaculties.every(
        faculty => faculty.faculty_id !== undefined &&
            faculty.faculty_id !== null
    );

    const isSameCoordinator =
        selectedFaculty &&
        currentCoordinator &&
        Number(selectedFaculty.faculty_id) ===
        Number(currentCoordinator.faculty_id);

    const canConfirm =
        selectedFaculty &&
        typedName === selectedFaculty.name &&
        !isSameCoordinator;

    const handleContinue = () => {
        if (!selectedFaculty || isSameCoordinator) return;

        setConfirmationStep(true);
    };

    const handleAssignment = async () => {
        if (!canConfirm || updating) return;

        const success = await onAssign(
            section.section_id,
            section.batch_id,
            selectedFaculty.faculty_id
        );

        if (success) {
            onClose();
        }
    };

    const handleClose = () => {
        if (updating) return;
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={handleClose}
        >

            <div
                className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-800"
                onClick={e => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            {confirmationStep
                                ? 'Confirm Assignment'
                                : currentCoordinator
                                    ? 'Change Coordinator'
                                    : 'Assign Coordinator'}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Section {section.section_name} · Batch {section.admission_year}
                        </p>
                    </div>

                    <button
                        onClick={handleClose}
                        disabled={updating}
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Close modal"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* Scrollable Content */}
                <div className="min-h-0 flex-1 overflow-y-auto p-5">

                    {!confirmationStep ? (

                        <div className="space-y-5">

                            {currentCoordinator && (
                                <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-700/60">

                                    <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                        Current Coordinator
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <UserRound size={19} />

                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">
                                                {currentCoordinator.name}
                                            </p>

                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {currentCoordinator.designation}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* Faculty Selection */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Select New Coordinator
                                </label>

                                <select
                                    value={selectedFacultyId}
                                    onChange={e => setSelectedFacultyId(e.target.value)}
                                    className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">
                                        Select Faculty
                                    </option>

                                    <optgroup label="Available Faculty (Priority)">
                                        {availableFaculties.map(faculty => (
                                            <option
                                                key={faculty.faculty_id ?? faculty.user_id}
                                                value={faculty.faculty_id ?? ''}
                                                disabled={!faculty.faculty_id}
                                            >
                                                {faculty.name}
                                            </option>
                                        ))}
                                    </optgroup>

                                    <optgroup label="Already Assigned Faculty">
                                        {assignedFaculties.map(faculty => (
                                            <option
                                                key={faculty.faculty_id ?? faculty.user_id}
                                                value={faculty.faculty_id ?? ''}
                                                disabled={!faculty.faculty_id}
                                            >
                                                {faculty.name} ({faculty.assignmentCount} assigned)
                                            </option>
                                        ))}
                                    </optgroup>

                                </select>

                                {!hasFacultyIds && (
                                    <p className="mt-2 text-sm text-red-500">
                                        Faculty API must return faculty_id for every faculty member before assignments can be submitted.
                                    </p>
                                )}

                            </div>

                            {/* Selected Faculty Details */}
                            {selectedFaculty && (

                                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-600">

                                    <div className="flex items-center gap-2">
                                        <UserRound size={20} className="text-blue-900 dark:text-blue-400" />

                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">
                                                {selectedFaculty.name}
                                            </p>

                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {selectedFaculty.designation}
                                            </p>
                                        </div>
                                    </div>

                                    {alreadyAssigned && (

                                        <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-600">

                                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                                                <AlertTriangle size={17} />

                                                Already assigned to other sections
                                            </div>

                                            <div className="space-y-2">

                                                {selectedFaculty.assignments.map(assignment => (

                                                    <div
                                                        key={assignment.assignment_id}
                                                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                                                    >
                                                        <Users size={15} />

                                                        Section {assignment.section_name} · Batch {assignment.admission_year}

                                                    </div>

                                                ))}

                                            </div>

                                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                                Assigning this faculty member will increase their coordinator workload.
                                            </p>

                                        </div>

                                    )}

                                    {isSameCoordinator && (
                                        <p className="mt-3 text-sm text-red-500">
                                            This faculty member is already coordinating this section.
                                        </p>
                                    )}

                                </div>

                            )}

                        </div>

                    ) : (

                        <div className="space-y-5">

                            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">

                                <div className="mb-3 flex items-center gap-2 font-semibold text-yellow-800 dark:text-yellow-400">
                                    <AlertTriangle size={20} />

                                    Confirm Coordinator Assignment
                                </div>

                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    You are about to assign <strong>{selectedFaculty.name}</strong> as the coordinator of Section {section.section_name}, Batch {section.admission_year}.
                                </p>

                                {alreadyAssigned && (

                                    <div className="mt-3 border-t border-yellow-300 pt-3 dark:border-yellow-800">

                                        <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">
                                            Existing Responsibilities
                                        </p>

                                        {selectedFaculty.assignments.map(assignment => (
                                            <p
                                                key={assignment.assignment_id}
                                                className="mb-1 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                Section {assignment.section_name} · Batch {assignment.admission_year}
                                            </p>
                                        ))}

                                        <p className="mt-2 text-sm text-yellow-800 dark:text-yellow-400">
                                            This faculty member will coordinate multiple sections.
                                        </p>

                                    </div>

                                )}

                                {currentCoordinator && (
                                    <p className="mt-3 border-t border-yellow-300 pt-3 text-sm text-gray-700 dark:border-yellow-800 dark:text-gray-300">
                                        The previous coordinator, <strong>{currentCoordinator.name}</strong>, will be released from this assignment.
                                    </p>
                                )}

                            </div>

                            {/* GitHub Style Confirmation */}
                            <div>

                                <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                                    To confirm, type <strong>{selectedFaculty.name}</strong> below.
                                </label>

                                <input
                                    type="text"
                                    value={typedName}
                                    onChange={e => setTypedName(e.target.value)}
                                    placeholder="Enter faculty name"
                                    autoComplete="off"
                                    className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />

                                {typedName.length > 0 && !canConfirm && (
                                    <p className="mt-2 text-xs text-red-500">
                                        Faculty name does not match.
                                    </p>
                                )}

                            </div>

                        </div>

                    )}

                </div>

                {/* Footer */}
                <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 p-5 dark:border-gray-700">

                    {confirmationStep ? (

                        <>
                            <button
                                onClick={() => {
                                    setConfirmationStep(false);
                                    setTypedName('');
                                }}
                                disabled={updating}
                                className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>

                            <button
                                onClick={handleAssignment}
                                disabled={!canConfirm || updating}
                                className="flex items-center gap-2 rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {updating ? (
                                    <>
                                        <LoaderCircle size={16} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={16} />
                                        Confirm Assignment
                                    </>
                                )}
                            </button>
                        </>

                    ) : (

                        <>
                            <button
                                onClick={handleClose}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleContinue}
                                disabled={!selectedFaculty || isSameCoordinator || !hasFacultyIds}
                                className="rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Continue
                            </button>
                        </>

                    )}

                </div>

            </div>

        </div>
    );
};

export default AssignCoordinator;
