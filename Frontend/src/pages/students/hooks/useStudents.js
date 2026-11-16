import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const readResponse = async (response, fallback) => {
    const result = await response.json();
    if (!response.ok || result.success === false) {
        throw new Error(result.message || fallback);
    }
    return result;
};

const useStudents = () => {
    const [students, setStudents] = useState([]);
    const [sections, setSections] = useState([]);
    const [batches, setBatches] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const paths = ['/api/users?role=STUDENT', '/api/sections', '/api/batches', '/api/coordinators', '/api/profile'];
            const responses = await Promise.all(paths.map((path) => fetch(`${API_URL}${path}`, { credentials: 'include' })));
            const results = await Promise.all(responses.map((response) => readResponse(response, 'Failed to load student data.')));
            const studentRows = results[0].users;
            if (!Array.isArray(studentRows) || !Array.isArray(results[1].data) || !Array.isArray(results[2].data) || !Array.isArray(results[3].data)) {
                throw new Error('Invalid student API response format.');
            }
            setStudents(studentRows);
            setSections(results[1].data);
            setBatches(results[2].data);
            setAssignments(results[3].data);
            setProfile(results[4].data || null);
        } catch (err) {
            console.error('Error fetching student data:', err);
            setError(err.message || 'Unable to load student information.');
            setStudents([]);
            setSections([]);
            setBatches([]);
            setAssignments([]);
            toast.error(err.message || 'Unable to load student information.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadStudents = async () => { await fetchData(); };
        loadStudents();
    }, [fetchData]);

    return { students, sections, batches, assignments, profile, loading, error, refreshStudents: fetchData };
};

export default useStudents;
