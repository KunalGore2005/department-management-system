import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const useFaculty = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFaculty = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [facultyRes, allocationRes, coordinatorRes] =
                await Promise.all([
                    fetch(`${API_URL}/api/users?role=FACULTY`, {
                        credentials: 'include',
                    }),
                    fetch(`${API_URL}/api/faculty-subject-sections`, {
                        credentials: 'include',
                    }),
                    fetch(`${API_URL}/api/coordinators`, {
                        credentials: 'include',
                    }),
                ]);

            // Check HTTP responses
            if (!facultyRes.ok || !allocationRes.ok || !coordinatorRes.ok) {
                throw new Error('Failed to fetch faculty data.');
            }

            // Parse API responses
            const [facultyResult, allocationResult, coordinatorResult] =
                await Promise.all([
                    facultyRes.json(),
                    allocationRes.json(),
                    coordinatorRes.json(),
                ]);

            // Check API response status
            if (
                !facultyResult.success ||
                !allocationResult.success ||
                !coordinatorResult.success
            ) {
                throw new Error('Unable to load faculty information.');
            }

            // Extract response arrays
            const facultyList = facultyResult.users || [];
            const allocations = allocationResult.data || [];
            const coordinators = coordinatorResult.data || [];

            // Validate response formats
            if (
                !Array.isArray(facultyList) ||
                !Array.isArray(allocations) ||
                !Array.isArray(coordinators)
            ) {
                throw new Error('Invalid faculty API response format.');
            }

            // Create a map to avoid duplicate faculty records
            const facultyMap = new Map();

            facultyList.forEach((member) => {
                facultyMap.set(member.faculty_id, {
                    ...member,
                    teachingAssignments: [],
                    coordinatorAssignments: [],
                });
            });

            // Attach teaching assignments
            allocations.forEach((allocation) => {
                const member = facultyMap.get(allocation.faculty_id);

                if (member) {
                    member.teachingAssignments.push({
                        allocation_id: allocation.allocation_id,
                        subject_id: allocation.subject_id,
                        subject_code: allocation.subject_code,
                        subject_name: allocation.subject_name,
                        section_id: allocation.section_id,
                        section_name: allocation.section_name,
                        batch_id: allocation.batch_id,
                        admission_year: allocation.admission_year,
                    });
                }
            });

            // Attach coordinator assignments
            coordinators.forEach((coordinator) => {
                const member = facultyMap.get(coordinator.faculty_id);

                if (member) {
                    member.coordinatorAssignments.push({
                        assignment_id: coordinator.assignment_id,
                        section_id: coordinator.section_id,
                        section_name: coordinator.section_name,
                        batch_id: coordinator.batch_id,
                        admission_year: coordinator.admission_year,
                        assigned_date: coordinator.assigned_date,
                    });
                }
            });

            // Update faculty state
            setFaculty(Array.from(facultyMap.values()));

        } catch (err) {
            console.error('Error fetching faculty:', err);
            setFaculty([]);
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaculty();
    }, [fetchFaculty]);

    return {
        faculty,
        loading,
        error,
        refreshFaculty: fetchFaculty,
    };
};

export default useFaculty;