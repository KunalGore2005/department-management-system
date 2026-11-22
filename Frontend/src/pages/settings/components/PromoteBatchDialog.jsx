import { AlertTriangle, GraduationCap, X } from "lucide-react";

const PromoteBatchDialog = ({ batch, saving, onCancel, onConfirm }) => {
    if (!batch) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) onCancel();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="promote-dialog-title"
                className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-800"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h2 id="promote-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                                Confirm batch promotion
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Review the semester change.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close dialog"
                        onClick={onCancel}
                        disabled={saving}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="text-blue-700 dark:text-blue-300" size={22} />
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                Batch {batch.admissionYear}–{Number(batch.admissionYear) + 4}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Current semester: {batch.currentSemester}
                            </p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                        This will promote the entire batch to semester{" "}
                        <span className="font-semibold">{Number(batch.currentSemester) + 1}</span>. The
                        current semester will change for all students in this batch.
                    </p>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={saving}
                        className="rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Promoting..." : "Confirm Promotion"}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default PromoteBatchDialog;
