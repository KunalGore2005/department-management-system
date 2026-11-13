import React, { useMemo, useState } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import useFaculty from './useFaculty';
import FacultyTable from './FacultyTable';
import AddFaculty from './AddFaculty';
import EditFaculty from './EditFaculty';

import { toast } from 'sonner';

const FacultyDirectory = () => {
    const { faculty, loading, error, refreshFaculty } = useFaculty();

    const [search, setSearch] = useState('');
    const [coordinatorFilter, setCoordinatorFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [batchFilter, setBatchFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');
    const [showAddFaculty, setShowAddFaculty] = useState(false);
    const [showEditFaculty, setShowEditFaculty] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [updatingFacultyId, setUpdatingFacultyId] = useState(null);

    // Get unique batches from teaching and coordinator assignments
    const batches = useMemo(() => {
        const batchMap = new Map();

        faculty.forEach((member) => {
            [
                ...member.teachingAssignments,
                ...member.coordinatorAssignments,
            ].forEach((assignment) => {
                batchMap.set(
                    assignment.batch_id,
                    assignment.admission_year
                );
            });
        });

        return Array.from(batchMap.entries()).map(([id, year]) => ({
            id,
            year,
        })).sort((a, b) => b.year - a.year);
    }, [faculty]);

    // Get sections available for selected batch
    const sections = useMemo(() => {
        if (batchFilter === 'all') return [];

        const sectionMap = new Map();

        faculty.forEach((member) => {
            [
                ...member.teachingAssignments,
                ...member.coordinatorAssignments,
            ].forEach((assignment) => {
                if (String(assignment.batch_id) === batchFilter) {
                    sectionMap.set(
                        assignment.section_id,
                        assignment.section_name
                    );
                }
            });
        });

        return Array.from(sectionMap.entries()).map(([id, name]) => ({
            id,
            name,
        })).sort((a, b) => a.name.localeCompare(b.name));
    }, [faculty, batchFilter]);

    // Apply search and filters
    const filteredFaculty = useMemo(() => {
        return faculty.filter((member) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                member.name?.toLowerCase().includes(searchValue) ||
                member.email?.toLowerCase().includes(searchValue);

            const matchesCoordinator =
                coordinatorFilter === 'all' ||
                (coordinatorFilter === 'coordinator' &&
                    member.coordinatorAssignments.length > 0) ||
                (coordinatorFilter === 'non-coordinator' &&
                    member.coordinatorAssignments.length === 0);

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && Boolean(member.is_active)) ||
                (statusFilter === 'inactive' && !Boolean(member.is_active));

            const allAssignments = [
                ...member.teachingAssignments,
                ...member.coordinatorAssignments,
            ];

            const matchesBatch =
                batchFilter === 'all' ||
                allAssignments.some(
                    (assignment) =>
                        String(assignment.batch_id) === batchFilter
                );

            const matchesSection =
                sectionFilter === 'all' ||
                allAssignments.some(
                    (assignment) =>
                        String(assignment.section_id) === sectionFilter
                );

            return (
                matchesSearch &&
                matchesCoordinator &&
                matchesStatus &&
                matchesBatch &&
                matchesSection
            );
        });
    }, [
        faculty,
        search,
        coordinatorFilter,
        statusFilter,
        batchFilter,
        sectionFilter,
    ]);

    const handleBatchChange = (value) => {
        setBatchFilter(value);
        setSectionFilter('all');
    };

    // Handle edit button click
    const handleEdit = (member) => {
        setSelectedFaculty(member);
        setShowEditFaculty(true);
    };

    // Handle activate/deactivate button click
    const handleToggleStatus = async (member) => {
        const userId = member.user_id;
        const isCurrentlyActive = Number(member.is_active) === 1;

        if (!userId) {
            toast.error('Faculty user ID is missing.');
            return;
        }

        const action = isCurrentlyActive ? 'deactivate' : 'activate';

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${member.name}'s account?`
        );

        if (!confirmed) return;

        try {
            setUpdatingFacultyId(userId);

            const response = await fetch(
                `${API_URL}/api/users/${userId}/status`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        is_active: !isCurrentlyActive,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to update faculty status.'
                );
            }

            toast.success(
                `Faculty account ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully.`
            );

            await refreshFaculty();

        } catch (error) {
            console.error('Error updating faculty status:', error);
            toast.error(error.message || 'Something went wrong.');
        } finally {
            setUpdatingFacultyId(null);
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Faculty Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage faculty accounts, teaching assignments and coordinators.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={refreshFaculty}
                        disabled={loading}
                        className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        title="Refresh faculty"
                    >
                        <RefreshCw
                            size={18}
                            className={loading ? 'animate-spin' : ''}
                        />
                    </button>

                    <button
                        onClick={() => setShowAddFaculty(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Faculty
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

                {/* Search */}
                <div className="relative lg:col-span-2">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search faculty by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Coordinator Filter */}
                <select
                    value={coordinatorFilter}
                    onChange={(e) => setCoordinatorFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                >
                    <option value="all">All Faculty</option>
                    <option value="coordinator">Coordinators</option>
                    <option value="non-coordinator">Non-Coordinators</option>
                </select>

                {/* Batch Filter */}
                <select
                    value={batchFilter}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                >
                    <option value="all">All Batches</option>
                    {batches.map((batch) => (
                        <option key={batch.id} value={String(batch.id)}>
                            {batch.year}-{batch.year + 4}
                        </option>
                    ))}
                </select>

                {/* Section Filter */}
                <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    disabled={batchFilter === 'all'}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm disabled:opacity-50"
                >
                    <option value="all">All Sections</option>
                    {sections.map((section) => (
                        <option key={section.id} value={String(section.id)}>
                            Section {section.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Account status:</span>

                {['all', 'active', 'inactive'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${statusFilter === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="py-12 text-center text-gray-500">
                    Loading faculty...
                </div>
            ) : error ? (
                <div className="py-12 text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={refreshFaculty}
                        className="mt-3 text-sm text-blue-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            ) : (
                <FacultyTable
                    faculty={filteredFaculty}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    updatingFacultyId={updatingFacultyId}
                />
            )}

            {/* Result count */}
            {!loading && !error && (
                <p className="text-sm text-gray-500">
                    Showing {filteredFaculty.length} of {faculty.length} faculty members
                </p>
            )}

            <AddFaculty
                isOpen={showAddFaculty}
                onClose={() => setShowAddFaculty(false)}
                onSuccess={refreshFaculty}
            />

            <EditFaculty
                isOpen={showEditFaculty}
                faculty={selectedFaculty}
                onClose={() => {
                    setShowEditFaculty(false);
                    setSelectedFaculty(null);
                }}
                onSuccess={refreshFaculty}
            />
        </div>
    );
};

export default FacultyDirectory;