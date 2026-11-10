
import React, { useState } from 'react';
import {
    UserRound,
    Phone,
    CalendarDays,
    Users,
    UserPlus,
    RefreshCw,
    LoaderCircle,
    AlertCircle
} from 'lucide-react';

import AssignCoordinator from './AssignCoordinator';

const AllCoordinators = ({
    groupedSections,
    availableFaculties,
    assignedFaculties,
    loading,
    error,
    updating,
    assignCoordinator,
    fetchData
}) => {

    const [selectedSection, setSelectedSection] = useState(null);

    const formatDate = (date) => {
        if (!date) return 'N/A';

        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex h-60 items-center justify-center">
                <LoaderCircle className="animate-spin text-blue-900" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                <AlertCircle className="text-red-500" size={32} />

                <p className="text-gray-700 dark:text-gray-300">
                    {error}
                </p>

                <button
                    onClick={fetchData}
                    className="rounded-md bg-blue-900 px-4 py-2 text-white hover:bg-blue-800"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!groupedSections.length) {
        return (
            <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-gray-800">
                No sections found.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8">

                {groupedSections.map(batch => (

                    <section key={batch.batch_id}>

                        {/* Batch Heading */}
                        <div className="mb-4 flex items-center gap-2">
                            <CalendarDays
                                size={20}
                                className="text-blue-900 dark:text-blue-400"
                            />

                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                Admission Batch {batch.admission_year}
                            </h2>

                            <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                {batch.sections.length} Sections
                            </span>
                        </div>

                        {/* Section Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                            {batch.sections.map(section => {

                                const coordinator = section.coordinator;

                                return (
                                    <div
                                        key={`${section.section_id}-${section.batch_id}`}
                                        className="flex min-w-0 flex-col rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
                                    >

                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-3">

                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                                    Section {section.section_name}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    Batch {section.admission_year}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                                                    coordinator
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                                                }`}
                                            >
                                                {coordinator ? 'Assigned' : 'Unassigned'}
                                            </span>

                                        </div>

                                        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

                                        {/* Intake Strength */}
                                        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Users size={17} />

                                            <span>
                                                Intake Strength: {section.intake_strength}
                                            </span>
                                        </div>

                                        {/* Coordinator Details */}
                                        <div className="min-h-27.5 flex-1">

                                            {coordinator ? (

                                                <div className="space-y-3">

                                                    <div className="flex items-center gap-2">
                                                        <UserRound
                                                            size={19}
                                                            className="shrink-0 text-blue-900 dark:text-blue-400"
                                                        />

                                                        <div className="min-w-0">
                                                            <p className="wrap-break-words font-semibold text-gray-800 dark:text-white">
                                                                {coordinator.name}
                                                            </p>

                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {coordinator.designation}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <Phone size={16} />

                                                        <span>
                                                            {coordinator.phone || 'Not available'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <CalendarDays size={16} />

                                                        <span>
                                                            Assigned: {formatDate(coordinator.assigned_date)}
                                                        </span>
                                                    </div>

                                                </div>

                                            ) : (

                                                <div className="flex h-full items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <UserPlus size={20} />

                                                    No coordinator assigned yet.
                                                </div>

                                            )}

                                        </div>

                                        {/* Assignment Button */}
                                        <button
                                            onClick={() => setSelectedSection(section)}
                                            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-900 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
                                        >
                                            {coordinator ? (
                                                <>
                                                    <RefreshCw size={16} />
                                                    Change Coordinator
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={16} />
                                                    Assign Coordinator
                                                </>
                                            )}
                                        </button>

                                    </div>
                                );
                            })}

                        </div>

                    </section>

                ))}

            </div>

            {/* Assignment Modal */}
            {selectedSection && (
                <AssignCoordinator
                    section={selectedSection}
                    availableFaculties={availableFaculties}
                    assignedFaculties={assignedFaculties}
                    updating={updating}
                    onAssign={assignCoordinator}
                    onClose={() => setSelectedSection(null)}
                />
            )}

        </>
    );
};

export default AllCoordinators;
