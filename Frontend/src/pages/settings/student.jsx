import ProfileSettings from "./components/ProfileSettings";

const StudentSettings = () => (
    <div className="min-w-0 space-y-5 p-4 md:p-6 dark:bg-black">
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your personal profile information.
            </p>
        </div>
        <ProfileSettings />
    </div>
);

export default StudentSettings;
