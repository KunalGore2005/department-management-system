import { useState } from "react";
import { KeyRound, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { settingsRequest } from "../hooks/use-settings";

const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

const ChangePassword = ({ email }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState("start");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const requestCode = async () => {
        setSaving(true);
        try {
            const result = await settingsRequest("/api/auth/reset-password/request", {
                method: "POST",
                body: JSON.stringify({ email })
            });
            toast.success(result.message || "Verification code sent to your email.");
            setStep("verify");
        } catch (error) {
            toast.error(error.message || "Unable to send a verification code.");
        } finally {
            setSaving(false);
        }
    };

    const verifyCode = async (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(otp)) return toast.error("Enter the 6-digit verification code.");

        setSaving(true);
        try {
            const result = await settingsRequest("/api/auth/reset-password/verify", {
                method: "POST",
                body: JSON.stringify({ email, otp })
            });
            setResetToken(result.resetToken);
            setStep("new-password");
        } catch (error) {
            toast.error(error.message || "Unable to verify the code.");
        } finally {
            setSaving(false);
        }
    };

    const updatePassword = async (event) => {
        event.preventDefault();
        if (newPassword.length < 8) return toast.error("Password must be at least 8 characters long.");
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");

        setSaving(true);
        try {
            const result = await settingsRequest("/api/auth/reset-password/confirm", {
                method: "POST",
                headers: { Authorization: `Bearer ${resetToken}` },
                body: JSON.stringify({ newPassword })
            });
            toast.success(result.message || "Password changed successfully. Please sign in again.");
            navigate("/login", { replace: true });
        } catch (error) {
            toast.error(error.message || "Unable to change your password.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    <KeyRound size={20} />
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                        Verify your email before setting a new password.
                    </p>
                </div>
            </div>

            {step === "start" && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <p className="flex min-w-0 items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <Mail size={16} className="shrink-0 text-gray-500 dark:text-gray-300" />
                        <span>
                            A verification code will be sent to <strong className="break-all">{email}</strong>.
                        </span>
                    </p>
                    <button
                        type="button"
                        onClick={requestCode}
                        disabled={saving || !email}
                        className="shrink-0 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <LoaderCircle size={16} className="animate-spin" />
                                Sending...
                            </span>
                        ) : (
                            "Continue"
                        )}
                    </button>
                </div>
            )}

            {step === "verify" && (
                <form onSubmit={verifyCode} className="mt-4 space-y-3">
                    <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Email verification code
                        </span>
                        <input
                            value={otp}
                            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            className={inputClass}
                            placeholder="Enter the 6-digit code"
                        />
                    </label>
                    <div className="flex flex-wrap justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setStep("start")}
                            disabled={saving}
                            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                        >
                            {saving ? "Verifying..." : "Verify Code"}
                        </button>
                    </div>
                </form>
            )}

            {step === "new-password" && (
                <form onSubmit={updatePassword} className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
                        <ShieldCheck size={17} />
                        Email verified. Choose a new password.
                    </div>
                    <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            New password
                        </span>
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            className={inputClass}
                        />
                    </label>
                    <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Confirm new password
                        </span>
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className={inputClass}
                        />
                    </label>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
};

export default ChangePassword;
