import React, { useEffect, useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const initialFormData = {
    name: '',
    email: '',
    designation: '',
    phone: '',
    joining_date: '',
};

const EditFaculty = ({ isOpen, faculty, onClose, onSuccess }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && faculty) {
            setFormData({
                name: faculty.name || '',
                email: faculty.email || '',
                designation: faculty.designation || '',
                phone: faculty.phone || '',
                joining_date: faculty.joining_date
                    ? String(faculty.joining_date).slice(0, 10)
                    : '',
            });
        }
    }, [isOpen, faculty]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!faculty?.user_id) {
            toast.error('Faculty user ID is missing.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/users/${faculty.user_id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        designation: formData.designation.trim(),
                        phone: formData.phone.trim() || null,
                        joining_date: formData.joining_date || null,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Failed to update faculty details.'
                );
            }

            toast.success('Faculty details updated successfully.');

            onClose();
            onSuccess?.();

        } catch (error) {
            console.error('Error updating faculty:', error);
            toast.error(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !faculty) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-900">

                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Edit Faculty
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Update faculty member information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Faculty Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Designation
                        </label>
                        <select
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:text-white"
                        >
                            <option value="">Select designation</option>
                            <option value="Professor">Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Assistant Professor">Assistant Professor</option>
                            <option value="Senior Lecturer">Senior Lecturer</option>
                            <option value="Lecturer">Lecturer</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Joining Date
                        </label>
                        <input
                            type="date"
                            name="joining_date"
                            value={formData.joining_date}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditFaculty;