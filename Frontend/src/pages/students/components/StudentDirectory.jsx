import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, RefreshCw, Search, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import useStudents from '../hooks/useStudents';
import StudentSectionCards from './StudentSectionCards';
import StudentTable from './StudentTable';
import StudentFormModal from './StudentFormModal';

const API_URL = import.meta.env.VITE_API_URL;

const StudentDirectory = ({ role }) => {
    const { students, sections, batches, assignments, profile, loading, error, refreshStudents } = useStudents();
    const [search, setSearch] = useState('');
    const [selectedSection, setSelectedSection] = useState(null);
    const [modalStudent, setModalStudent] = useState(undefined);
    const [updatingId, setUpdatingId] = useState(null);
    const isHod = role === 'hod';
    const coordinatorSectionKeys = useMemo(() => new Set(assignments.filter((assignment) => Number(assignment.faculty_id) === Number(profile?.facultyId)).map((assignment) => `${assignment.batch_id}:${assignment.section_id}`)), [assignments, profile]);
    const canManage = isHod || coordinatorSectionKeys.size > 0;
    const canManageStudent = (student) => isHod || coordinatorSectionKeys.has(`${student.batch_id}:${student.section_id}`);
    const allowedSectionKeys = useMemo(() => isHod ? new Set(sections.map((section) => `${section.batch_id}:${section.section_id}`)) : coordinatorSectionKeys, [isHod, sections, coordinatorSectionKeys]);
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const globalResults = useMemo(() => normalizedSearch ? students.filter((student) => `${student.name || ''} ${student.enrollment_number || ''}`.toLocaleLowerCase().includes(normalizedSearch)) : [], [students, normalizedSearch]);
    const sectionStudents = useMemo(() => selectedSection ? students.filter((student) => Number(student.section_id) === Number(selectedSection.section_id) && Number(student.batch_id) === Number(selectedSection.batch_id)) : [], [students, selectedSection]);

    const saveStudent = async () => {
        setModalStudent(undefined);
        await refreshStudents();
    };

    const toggleStatus = async (student) => {
        const isActive = student.is_active === true || Number(student.is_active) === 1;
        const action = isActive ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} ${student.name}'s account?`)) return;
        try {
            setUpdatingId(student.user_id);
            const response = await fetch(`${API_URL}/api/users/${student.user_id}/status`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !isActive }) });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to update student status.');
            toast.success(`Student account ${isActive ? 'deactivated' : 'activated'} successfully.`);
            await refreshStudents();
        } catch (err) {
            console.error('Error updating student status:', err);
            toast.error(err.message || 'Something went wrong.');
        } finally { setUpdatingId(null); }
    };

    const selectedBatch = batches.find((batch) => Number(batch.batch_id) === Number(selectedSection?.batch_id));
    return <div className="space-y-6 p-4 md:p-6 dark:bg-black">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Student Management</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Browse department students by section or search the full department.</p></div>
            <div className="flex items-center gap-2">{canManage && <button type="button" onClick={() => setModalStudent(null)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"><Plus size={18} />Add Student</button>}<button type="button" onClick={refreshStudents} disabled={loading} title="Refresh students" className="rounded-lg border border-gray-200 p-2.5 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button></div>
        </div>
        {!isHod && <p className="text-xs text-gray-500">{canManage ? 'Coordinator access is available for assigned sections.' : 'Read-only access · You are not assigned as a section coordinator.'}</p>}
        <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setSelectedSection(null); }} placeholder="Search all students by name or enrollment number..." className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900" />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X size={17} /></button>}</div>
        {loading ? <div className="flex min-h-60 items-center justify-center text-gray-500"><RefreshCw size={22} className="mr-2 animate-spin text-blue-600" />Loading students...</div> : error ? <div className="py-12 text-center"><p className="text-red-500">{error}</p><button type="button" onClick={refreshStudents} className="mt-3 text-sm text-blue-600 hover:underline">Try again</button></div> : normalizedSearch ? <section className="space-y-4"><div className="flex items-center gap-2"><Users size={19} className="text-gray-500" /><h2 className="text-lg font-semibold text-gray-800 dark:text-white">Search results</h2><span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{globalResults.length}</span></div><StudentTable students={globalResults} sections={sections} batches={batches} canManage={canManage} canManageStudent={canManageStudent} onEdit={setModalStudent} onToggleStatus={toggleStatus} updatingId={updatingId} /><p className="text-sm text-gray-500">Showing {globalResults.length} of {students.length} department students</p></section> : selectedSection ? <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><button type="button" onClick={() => setSelectedSection(null)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800" aria-label="Back to sections"><ArrowLeft size={18} /></button><div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Batch {selectedBatch?.admission_year} · Section {selectedSection.section_name}</h2><p className="text-sm text-gray-500">{sectionStudents.length} students</p></div></div></div><StudentTable students={sectionStudents} sections={sections} batches={batches} canManage={canManage} canManageStudent={canManageStudent} onEdit={setModalStudent} onToggleStatus={toggleStatus} updatingId={updatingId} /></section> : <><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-800 dark:text-white">Sections</h2><span className="text-sm text-gray-500">{students.length} department students</span></div>{sections.length ? <StudentSectionCards batches={batches} sections={sections} students={students} onSelect={setSelectedSection} /> : <div className="rounded-xl border border-gray-200 py-12 text-center text-sm text-gray-500 dark:border-gray-700">No sections found.</div>}</>}
        {modalStudent !== undefined && <StudentFormModal student={modalStudent} sections={sections} batches={batches} allowedSectionKeys={allowedSectionKeys} onClose={() => setModalStudent(undefined)} onSuccess={saveStudent} />}
    </div>;
};

export default StudentDirectory;
