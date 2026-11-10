
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const useCoordinators = () => {
    const [sections, setSections] = useState([]);
    const [batches, setBatches] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const endpoints = [
                `${API_URL}/api/sections`,
                `${API_URL}/api/batches`,
                `${API_URL}/api/users?role=faculty`,
                `${API_URL}/api/coordinators`
            ];

            const responses = await Promise.all(
                endpoints.map(url =>
                    fetch(url, {
                        method: 'GET',
                        credentials: 'include'
                    })
                )
            );

            const failedResponse = responses.find(
                response => !response.ok
            );

            if (failedResponse) {
                throw new Error('Failed to fetch coordinator data.');
            }

            const [
                sectionsData,
                batchesData,
                facultiesData,
                coordinatorsData
            ] = await Promise.all(
                responses.map(response => response.json())
            );

            setSections(sectionsData.data || []);
            setBatches(batchesData.data || []);
            setFaculties(facultiesData.users || []);
            setAssignments(coordinatorsData.data || []);

        } catch (error) {
            console.error('Error fetching coordinator data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Match coordinator assignments with sections and batches.
    const coordinatorCards = sections.map(section => {
        const coordinator = assignments.find(
            assignment =>
                Number(assignment.section_id) === Number(section.section_id) &&
                Number(assignment.batch_id) === Number(section.batch_id)
        );

        return {
            ...section,
            coordinator: coordinator || null
        };
    });

    // Count the number of sections assigned to each faculty.
    const facultyWithAssignments = faculties.map(faculty => {
        const facultyAssignments = assignments.filter(
            assignment =>
                Number(assignment.faculty_id) === Number(faculty.faculty_id)
        );

        return {
            ...faculty,
            assignments: facultyAssignments,
            assignmentCount: facultyAssignments.length
        };
    });

    const availableFaculties = facultyWithAssignments
        .filter(faculty => faculty.assignmentCount === 0)
        .sort((a, b) => a.name.localeCompare(b.name));

    const assignedFaculties = facultyWithAssignments
        .filter(faculty => faculty.assignmentCount > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

    // Assign or replace coordinator.
    const assignCoordinator = async (sectionId, batchId, facultyId) => {
        if (!facultyId) {
            toast.error('Invalid faculty selection.');
            return false;
        }

        try {
            setUpdating(true);

            const response = await fetch(
                `${API_URL}/api/coordinators/${sectionId}/${batchId}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        faculty_id: facultyId
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to update coordinator.'
                );
            }

            toast.success(result.message || 'Coordinator updated successfully!');

            await fetchData();

            return true;

        } catch (error) {
            console.error('Error updating coordinator:', error);
            toast.error(error.message || 'Something went wrong.');
            return false;

        } finally {
            setUpdating(false);
        }
    };

    // Group cards according to admission batch.
    const groupedSections = batches
        .map(batch => ({
            ...batch,
            sections: coordinatorCards
                .filter(
                    section =>
                        Number(section.batch_id) === Number(batch.batch_id)
                )
                .sort((a, b) =>
                    a.section_name.localeCompare(b.section_name)
                )
        }))
        .filter(batch => batch.sections.length > 0)
        .sort((a, b) => b.admission_year - a.admission_year);

    return {
        sections,
        batches,
        faculties,
        assignments,
        groupedSections,
        availableFaculties,
        assignedFaculties,
        loading,
        error,
        updating,
        fetchData,
        assignCoordinator
    };
};

export default useCoordinators;
