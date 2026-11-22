import { useState } from "react";
import ProfileSettings from "./components/ProfileSettings";
import AcademicSettings from "./components/AcademicSettings";

const tabs = [
    { id: "profile", label: "Personal Profile" },
    { id: "academic", label: "Academic Settings" }
];

const HodSettings = () => {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="min-w-0 space-y-5 p-4 md:p-6 dark:bg-black">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage your profile and department academic settings.
                </p>
            </div>
            <div
                className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700"
                role="tablist"
                aria-label="Settings sections"
            >
                {tabs.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === id}
                        onClick={() => setActiveTab(id)}
                        className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
                            activeTab === id
                                ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-300"
                                : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div role="tabpanel">
                {activeTab === "profile" ? <ProfileSettings /> : <AcademicSettings />}
            </div>
        </div>
    );
};

export default HodSettings;
