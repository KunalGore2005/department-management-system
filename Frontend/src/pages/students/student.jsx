import { useEffect, useState } from 'react';
import { GraduationCap, LoaderCircle } from 'lucide-react';

const Student = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, { credentials: 'include' });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message || 'Failed to load student profile.');
                setProfile(result.data);
            } catch (err) {
                console.error('Error fetching student profile:', err);
                setError(err.message || 'Unable to load your student profile.');
            } finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-60 items-center justify-center">
                <LoaderCircle className="animate-spin text-blue-900" size={32} />
            </div>
        );
    }
    if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

    return (
        <div className="space-y-6 p-4 md:p-6 dark:bg-black">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    <GraduationCap size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Student Profile</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Your enrollment and section information.
                    </p>
                </div>
            </div>
            {profile && (
                <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.name}</h2>
                    <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[
                            ['Enrollment Number', profile.enrollmentNumber],
                            ['Email', profile.email],
                            ['Phone', profile.phone || 'Not provided'],
                            ['Batch', profile.admissionYear],
                            ['Section', profile.sectionName],
                            ['Account Status', profile.isActive ? 'Active' : 'Inactive']
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-medium uppercase text-gray-500">{label}</dt>
                                <dd className="mt-1 text-sm text-gray-800 dark:text-gray-200">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}
        </div>
    );
};

export default Student;
