import { useMemo, useState } from 'react';
import { Loader2, Save, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;
const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white';

const StudentFormModal = ({ student, sections, batches, allowedSectionKeys, onClose, onSuccess }) => {
    const editing = Boolean(student);
    const [form, setForm] = useState(() => student ? { name: student.name || '', email: student.email || '', phone: student.phone || '', enrollment_number: student.enrollment_number || '', batch_id: String(student.batch_id || ''), section_id: String(student.section_id || '') } : { name: '', email: '', phone: '', enrollment_number: '', batch_id: '', section_id: '' });
    const [loading, setLoading] = useState(false);
    const availableSections = useMemo(() => sections.filter((section) => Number(section.batch_id) === Number(form.batch_id) && allowedSectionKeys.has(`${section.batch_id}:${section.section_id}`)), [sections, form.batch_id, allowedSectionKeys]);

    const change = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value, ...(name === 'batch_id' ? { section_id: '' } : {}) }));
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!form.name.trim() || !form.email.trim() || (!editing && !form.enrollment_number.trim()) || !form.batch_id || !form.section_id) {
            toast.error('Please fill in all required fields.');
            return;
        }
        try {
            setLoading(true);
            const body = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || null, section_id: Number(form.section_id), batch_id: Number(form.batch_id) };
            if (!editing) Object.assign(body, { enrollment_number: form.enrollment_number.trim(), role: 'STUDENT' });
            const response = await fetch(`${API_URL}/api/users${editing ? `/${student.user_id}` : ''}`, {
                method: editing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || `Failed to ${editing ? 'update' : 'create'} student.`);
            toast.success(editing ? 'Student details updated successfully.' : 'Student account created successfully.');
            onSuccess();
        } catch (error) {
            console.error('Error saving student:', error);
            toast.error(error.message || 'Something went wrong.');
        } finally { setLoading(false); }
    };

    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"><div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Student' : 'Add Student'}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{editing ? 'Update student information and placement.' : 'Create a student account for the department.'}</p></div><button type="button" onClick={onClose} disabled={loading} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"><X size={20} /></button></div>
            <form onSubmit={submit}>
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                    <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Student Name *</span><input className={inputClass} name="name" value={form.name} onChange={change} required maxLength={100} disabled={loading} /></label>
                    <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</span><input className={inputClass} type="email" name="email" value={form.email} onChange={change} required maxLength={100} disabled={loading} /></label>
                    {!editing && <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Enrollment Number *</span><input className={inputClass} name="enrollment_number" value={form.enrollment_number} onChange={change} required maxLength={50} disabled={loading} /></label>}
                    <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</span><input className={inputClass} type="tel" name="phone" value={form.phone} onChange={change} maxLength={15} disabled={loading} /></label>
                    <label><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Batch *</span><select className={inputClass} name="batch_id" value={form.batch_id} onChange={change} required disabled={loading}><option value="">Select batch</option>{batches.filter((batch) => sections.some((section) => Number(section.batch_id) === Number(batch.batch_id) && allowedSectionKeys.has(`${section.batch_id}:${section.section_id}`))).map((batch) => <option key={batch.batch_id} value={batch.batch_id}>{batch.admission_year}–{Number(batch.admission_year) + 4}</option>)}</select></label>
                    <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Section *</span><select className={inputClass} name="section_id" value={form.section_id} onChange={change} required disabled={loading || !form.batch_id}><option value="">Select section</option>{availableSections.map((section) => <option key={`${section.batch_id}-${section.section_id}`} value={section.section_id}>Section {section.section_name}</option>)}</select></label>
                </div>
                <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700"><button type="button" onClick={onClose} disabled={loading} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button><button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : editing ? <Save size={16} /> : <UserPlus size={16} />}{loading ? 'Saving...' : editing ? 'Save Changes' : 'Add Student'}</button></div>
            </form>
        </div>
    </div>;
};

export default StudentFormModal;
