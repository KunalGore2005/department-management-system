import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(
        `${API_URL.replace(/\/$/, "")}${endpoint}`,
        {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
    }

    return result;
};

// Extract arrays safely from API responses
const getArrayData = (result) => {
    if (Array.isArray(result?.data)) {
        return result.data;
    }

    if (Array.isArray(result?.data?.data)) {
        return result.data.data;
    }

    return [];
};

const useSubjectAllocation = () => {
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    const [semester, setSemester] = useState(null);

    const [loading, setLoading] = useState(true);
    const [subjectsLoading, setSubjectsLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    const subjectRequestId = useRef(0);

    // Fetch initial data
    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                batchResult,
                sectionResult,
                facultyResult,
                allocationResult
            ] = await Promise.all([
                apiRequest("/api/batches"),
                apiRequest("/api/sections"),
                apiRequest("/api/users?role=FACULTY"),
                apiRequest("/api/faculty-subject-sections"),
            ]);

            const facultyData = getArrayData(facultyResult);

            setBatches(getArrayData(batchResult));
            setSections(getArrayData(sectionResult));
            setFaculty(facultyResult.users || []);
            setAllocations(getArrayData(allocationResult));

            console.log("Faculty API response:", facultyResult);
            console.log("Faculty loaded:", facultyData);

        } catch (err) {
            console.error("Initial data loading error:", err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Fetch subjects and semester for selected batch
    const fetchSubjects = useCallback(async (batchId) => {
        const requestId = ++subjectRequestId.current;

        if (!batchId) {
            setSubjects([]);
            setSemester(null);
            setSubjectsLoading(false);
            return;
        }

        try {
            setSubjectsLoading(true);
            setSubjects([]);
            setSemester(null);

            const result = await apiRequest(
                `/api/subject-allocation/${batchId}`
            );

            // Ignore an outdated response
            if (requestId !== subjectRequestId.current) return;

            setSubjects(result.data?.subjects || []);
            setSemester(result.data?.semester ?? null);

        } catch (err) {
            if (requestId === subjectRequestId.current) {
                console.error("Subject fetching error:", err);
                toast.error(err.message);
            }
        } finally {
            if (requestId === subjectRequestId.current) {
                setSubjectsLoading(false);
            }
        }
    }, []);

    // Select batch
    const selectBatch = (batchId) => {
        setSelectedBatch(batchId);
        setSelectedSection(null);
        setSubjects([]);
        setSemester(null);

        fetchSubjects(batchId);
    };

    // Select section
    const selectSection = (sectionId) => {
        setSelectedSection(sectionId);
    };

    // Refresh allocations
    const fetchAllocations = async () => {
        try {
            const result = await apiRequest(
                "/api/faculty-subject-sections"
            );

            setAllocations(getArrayData(result));

        } catch (err) {
            console.error("Allocation fetching error:", err);
            toast.error(err.message);
        }
    };

    // Assign faculty to a subject
    // Receives an object from SubjectList.jsx
    const assignFaculty = async ({ facultyId, subjectId }) => {
        if (!facultyId || !subjectId || !selectedBatch || !selectedSection) {
            toast.error("Please select a faculty member and section.");
            return false;
        }

        try {
            setUpdating(true);

            await apiRequest("/api/faculty-subject-sections", {
                method: "POST",
                body: JSON.stringify({
                    facultyId: Number(facultyId),
                    subjectId: Number(subjectId),
                    sectionId: Number(selectedSection),
                    batchId: Number(selectedBatch),
                }),
            });

            toast.success("Faculty assigned successfully.");

            await fetchAllocations();

            return true;

        } catch (err) {
            console.error("Faculty assignment error:", err);
            toast.error(err.message);
            return false;

        } finally {
            setUpdating(false);
        }
    };

    // Update existing faculty assignment
    // Receives an object from SubjectList.jsx
    const updateAssignment = async (
        allocationId,
        { facultyId, subjectId }
    ) => {
        if (!allocationId || !facultyId || !subjectId) {
            toast.error("Invalid assignment details.");
            return false;
        }

        try {
            setUpdating(true);

            await apiRequest(
                `/api/faculty-subject-sections/${allocationId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        facultyId: Number(facultyId),
                        subjectId: Number(subjectId),
                        sectionId: Number(selectedSection),
                        batchId: Number(selectedBatch),
                    }),
                }
            );

            toast.success("Faculty assignment updated successfully.");

            await fetchAllocations();

            return true;

        } catch (err) {
            console.error("Assignment update error:", err);
            toast.error(err.message);
            return false;

        } finally {
            setUpdating(false);
        }
    };

    // Delete existing assignment
    const removeAssignment = async (allocationId) => {
        try {
            setUpdating(true);

            await apiRequest(
                `/api/faculty-subject-sections/${allocationId}`,
                {
                    method: "DELETE",
                }
            );

            toast.success("Faculty assignment removed.");

            await fetchAllocations();

            return true;

        } catch (err) {
            console.error("Assignment deletion error:", err);
            toast.error(err.message);
            return false;

        } finally {
            setUpdating(false);
        }
    };

    // Sections belonging to selected batch
    const filteredSections = sections.filter(
        (section) =>
            Number(section.batch_id) === Number(selectedBatch)
    );

    // Allocations belonging to selected section
    const filteredAllocations = allocations.filter(
        (allocation) =>
            Number(allocation.batch_id) === Number(selectedBatch) &&
            Number(allocation.section_id) === Number(selectedSection)
    );

    // Faculty not assigned in this section appear first
    const sortedFaculty = [...faculty].sort((a, b) => {
        const aAssigned = filteredAllocations.some(
            (allocation) =>
                Number(allocation.faculty_id) === Number(a.faculty_id)
        );

        const bAssigned = filteredAllocations.some(
            (allocation) =>
                Number(allocation.faculty_id) === Number(b.faculty_id)
        );

        return Number(aAssigned) - Number(bAssigned);
    });

    return {
        batches,
        sections,
        faculty,
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
        removeAssignment,
        fetchAllocations,
    };
};

export default useSubjectAllocation;
