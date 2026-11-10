
import React from 'react';
import { RefreshCw } from 'lucide-react';

import AllCoordinators from './components/AllCoordinators';
import useCoordinators from './components/use-coordinators';

const Hod = () => {

    const {
        groupedSections,
        availableFaculties,
        assignedFaculties,
        loading,
        error,
        updating,
        fetchData,
        assignCoordinator
    } = useCoordinators();

    return (
        <div className="h-full w-full overflow-y-auto p-4 dark:bg-black">

            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Coordinator Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage section-wise faculty coordinator assignments.
                    </p>
                </div>

                <button
                    onClick={fetchData}
                    disabled={loading || updating}
                    className="flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? 'animate-spin' : ''}
                    />

                    Refresh
                </button>

            </div>

            {/* Coordinator Cards */}
            <AllCoordinators
                groupedSections={groupedSections}
                availableFaculties={availableFaculties}
                assignedFaculties={assignedFaculties}
                loading={loading}
                error={error}
                updating={updating}
                assignCoordinator={assignCoordinator}
                fetchData={fetchData}
            />

        </div>
    );
};

export default Hod;
