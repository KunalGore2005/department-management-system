import { useState } from "react";
import { AlertCircle, CheckCircle2, GraduationCap, RefreshCw } from "lucide-react";
import { useAcademicSettings } from "../hooks/use-settings";
import PromoteBatchDialog from "./PromoteBatchDialog";

const AcademicSettings = () => {
    const { batches, loading, error, promotingBatchId, refreshBatches, promoteBatch } = useAcademicSettings();
    const [selectedBatch, setSelectedBatch] = useState(null);

    const confirmPromotion = async () => {
        if (!selectedBatch || promotingBatchId !== null) return;
        const succeeded = await promoteBatch(selectedBatch.batchId);
        if (succeeded) setSelectedBatch(null);
    };

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Academic Settings</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Review the current semester for each admission batch.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => refreshBatches()}
                    disabled={loading}
                    title="Refresh academic settings"
                    className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {loading ? (
                <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-gray-500">
                    <RefreshCw size={18} className="animate-spin text-blue-700" />
                    Loading academic settings...
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                    <button
                        type="button"
                        onClick={() => refreshBatches()}
                        className="mt-3 font-semibold underline"
                    >
                        Try again
                    </button>
                </div>
            ) : batches.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
                    <GraduationCap size={28} className="mx-auto text-gray-400" />
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                        No batch settings are available.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {batches.map((batch) => (
                        <article
                            key={batch.batchId}
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                        <GraduationCap size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Batch {batch.admissionYear}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {batch.admissionYear}–{Number(batch.admissionYear) + 4}
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                    <CheckCircle2 size={14} />
                                    Active
                                </span>
                            </div>
                            <div className="my-4 rounded-lg bg-gray-50 px-3 py-3 dark:bg-gray-900">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Current semester
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                    Semester {batch.currentSemester}
                                </p>
                            </div>
                            {Number(batch.currentSemester) < 8 && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedBatch(batch)}
                                    disabled={promotingBatchId !== null}
                                    className="w-full rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {Number(promotingBatchId) === Number(batch.batchId)
                                        ? "Promoting..."
                                        : "Promote Batch"}
                                </button>
                            )}
                            {Number(batch.currentSemester) === 8 && (
                                <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-center text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                                    Final semester reached
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}

            <PromoteBatchDialog
                batch={selectedBatch}
                saving={promotingBatchId !== null}
                onCancel={() => setSelectedBatch(null)}
                onConfirm={confirmPromotion}
            />
        </section>
    );
};

export default AcademicSettings;
