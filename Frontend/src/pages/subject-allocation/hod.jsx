import useSubjectAllocation from "./components/use-subject-allocation";
import BatchSections from "./components/BatchSections";
import SubjectList from "./components/SubjectList";
import { BookOpen, LoaderCircle } from "lucide-react";

const Hod = () => {
    const {
        batches,
        filteredSections,
        selectedBatch,
        selectedSection,
        subjects,
        semester,
        sortedFaculty,
        filteredAllocations,
        loading,
        subjectsLoading,
        updating,
        error,
        selectBatch,
        selectSection,
        assignFaculty,
        updateAssignment,
        removeAssignment
    } = useSubjectAllocation();

    // Assign a faculty member to a subject
    const handleAssign = ({ facultyId, subjectId }) => {
        return assignFaculty({
            facultyId,
            subjectId,
            sectionId: selectedSection,
            batchId: selectedBatch
        });
    };

    // Change the faculty assigned to a subject
    const handleUpdate = (allocationId, { facultyId, subjectId }) => {
        return updateAssignment(allocationId, {
            facultyId,
            subjectId,
            sectionId: selectedSection,
            batchId: selectedBatch
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoaderCircle className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6 min-h-full h-contain dark:bg-black">

            {/* Page Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <BookOpen size={24} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Subject Allocation
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Manage subject-wise faculty assignments.
                        </p>
                    </div>
                </div>
            </div>

            {/* Batch and Section Selection */}
            <BatchSections
                batches={batches}
                sections={filteredSections}
                selectedBatch={selectedBatch}
                selectedSection={selectedSection}
                onBatchSelect={selectBatch}
                onSectionSelect={selectSection}
            />

            {/* Subject List */}
            {selectedSection && (
                <div className="space-y-4">

                    <div className="flex flex-wrap items-center justify-between gap-2 ">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                Subjects
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Semester {semester} subject allocation
                            </p>
                        </div>

                        <span className="text-sm px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                            {subjects.length} Subjects
                        </span>
                    </div>

                    {subjectsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoaderCircle
                                className="animate-spin text-indigo-600"
                                size={28}
                            />
                        </div>
                    ) : (
                        <SubjectList
                            subjects={subjects}
                            allocations={filteredAllocations}
                            faculty={sortedFaculty}
                            onAssign={handleAssign}
                            onUpdate={handleUpdate}
                            onRemove={removeAssignment}
                            updating={updating}
                        />
                    )}
                </div>
            )}

        </div>
    );
};

export default Hod;
