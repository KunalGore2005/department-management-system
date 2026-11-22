import { useState } from "react";
import { Pencil, RefreshCw, Save, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { useProfileSettings } from "../hooks/use-settings";
import ChangePassword from "./ChangePassword";

const fieldClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:opacity-100 disabled:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-900 dark:disabled:text-white";

const ProfileSettings = () => {
    const { profile, loading, error, saving, refreshProfile, updateProfile } = useProfileSettings();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", phone: "" });

    const cancelEdit = () => {
        setForm({ name: profile?.name || "", email: profile?.email || "", phone: profile?.phone || "" });
        setEditing(false);
    };

    const saveChanges = async (event) => {
        event.preventDefault();
        const name = form.name.trim();
        const email = form.email.trim();
        const phone = form.phone.trim();

        if (!name) return toast.error("Name is required.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email address.");
        if (phone && !/^\d{10,15}$/.test(phone)) return toast.error("Phone number must contain 10 to 15 digits.");

        const saved = await updateProfile({ name, email, phone: phone || null });
        if (saved) setEditing(false);
    };

    const readOnlyFields = profile?.role === "STUDENT"
        ? [
            ["Enrollment Number", profile.enrollmentNumber],
            ["Section", profile.sectionName],
            ["Batch / Admission Year", profile.admissionYear]
        ]
        : [
            ["Faculty ID", profile?.facultyId],
            ["Designation", profile?.designation],
            ["Joining Date", profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : null]
        ].filter(([label, value]) => label !== "Faculty ID" || value != null);

    if (loading) {
        return (
            <div className="flex min-h-60 items-center justify-center gap-2 text-sm text-gray-500">
                <RefreshCw size={18} className="animate-spin text-blue-700" />
                Loading profile...
            </div>
        );
    }
    if (error && !profile) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                <p>{error}</p>
                <button
                    type="button"
                    onClick={() => refreshProfile()}
                    className="mt-3 font-semibold underline"
                >
                    Try again
                </button>
            </div>
        );
    }
    if (!profile) return null;

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Personal Profile</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your contact information and review your account details.
                    </p>
                </div>
                {!editing && (
                    <button
                        type="button"
                        onClick={() => {
                            setForm({
                                name: profile.name || "",
                                email: profile.email || "",
                                phone: profile.phone || ""
                            });
                            setEditing(true);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        <Pencil size={16} />
                        Edit Profile
                    </button>
                )}
            </div>

            <form
                onSubmit={saveChanges}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
                <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-700">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        <UserRound size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Profile information</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {profile.role === "STUDENT" ? "Student account" : "Faculty account"}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[["Name", "name", "text"], ["Email", "email", "email"], ["Phone number", "phone", "tel"]].map(
                        ([label, key, type]) => (
                            <label key={key} className="space-y-1.5">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {label}
                                </span>
                                <input
                                    type={type}
                                    value={editing ? form[key] : profile[key] || ""}
                                    disabled={!editing || saving}
                                    onChange={(event) =>
                                        setForm((current) => ({ ...current, [key]: event.target.value }))
                                    }
                                    className={fieldClass}
                                    autoComplete={
                                        key === "name" ? "name" : key === "email" ? "email" : "tel"
                                    }
                                />
                            </label>
                        )
                    )}
                </div>
                {readOnlyFields.length > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-700">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Academic information{" "}
                            <span className="font-normal text-gray-500 dark:text-gray-400">
                                · read only
                            </span>
                        </h3>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {readOnlyFields.map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-lg bg-gray-50 px-3 py-3 dark:bg-gray-900"
                                >
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        {label}
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        {value || "Not available"}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}
                {editing && (
                    <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={16} />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </form>
            <ChangePassword email={profile.email} />
        </section>
    );
};

export default ProfileSettings;
