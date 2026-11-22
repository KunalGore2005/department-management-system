import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, GraduationCap, LoaderCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";

const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 dark:border-gray-600 dark:bg-gray-900 dark:text-white";

export default function StudentSignup() {
    const [form, setForm] = useState({ fullName: "", email: "", phoneNumber: "", enrollmentNumber: "", batchId: "", sectionId: "" });
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const availableSections = useMemo(() => sections.filter(section => String(section.batch_id) === form.batchId), [sections, form.batchId]);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const response = await fetch(`${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api/student-signup/options`);
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message || "Unable to load enrollment options.");
                setBatches(result.data?.batches || []);
                setSections(result.data?.sections || []);
            } catch (err) {
                setError(err.message || "Unable to load enrollment options.");
            } finally {
                setLoadingOptions(false);
            }
        };
        loadOptions();
    }, []);

    const submit = async event => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const response = await fetch(`${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api/student-signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Unable to submit your application.");
            setSubmitted(true);
        } catch (err) {
            setError(err.message || "Unable to submit your application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-gray-950">
            <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:p-8">
                <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-900 dark:text-slate-300 dark:hover:text-white">
                    <ArrowLeft size={16} /> Back to login
                </Link>

                {submitted ? (
                    <div className="py-4 text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"><CheckCircle2 size={30} /></span>
                        <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">Application submitted</h1>
                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Your student application has been sent to the HOD for review. If approved, your login account and student record will be created.</p>
                        <Link to="/login" className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">Return to login</Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex items-center gap-3">
                            <span className="rounded-xl bg-blue-100 p-3 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"><GraduationCap size={24} /></span>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student application</h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Request access to the college portal.</p>
                            </div>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <label className="block space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Full name
                                <input className={field} name="fullName" autoComplete="name" maxLength={150} value={form.fullName} onChange={event => setForm({ ...form, fullName: event.target.value })} required />
                            </label>
                            <label className="block space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Email address
                                <input className={field} type="email" name="email" autoComplete="email" maxLength={255} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required />
                            </label>
                            <label className="block space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Phone number
                                <input className={field} type="tel" name="phoneNumber" autoComplete="tel" maxLength={30} value={form.phoneNumber} onChange={event => setForm({ ...form, phoneNumber: event.target.value })} required />
                            </label>
                            <label className="block space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Enrollment number
                                <input className={field} name="enrollmentNumber" maxLength={50} value={form.enrollmentNumber} onChange={event => setForm({ ...form, enrollmentNumber: event.target.value })} required />
                            </label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Batch
                                    <select className={field} value={form.batchId} onChange={event => setForm({ ...form, batchId: event.target.value, sectionId: "" })} disabled={loadingOptions || !batches.length} required>
                                        <option value="">{loadingOptions ? "Loading batches…" : "Choose batch"}</option>
                                        {batches.map(batch => <option key={batch.batch_id} value={batch.batch_id}>{batch.admission_year}</option>)}
                                    </select>
                                </label>
                                <label className="block space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Section
                                    <select className={field} value={form.sectionId} onChange={event => setForm({ ...form, sectionId: event.target.value })} disabled={!form.batchId || !availableSections.length} required>
                                        <option value="">{form.batchId ? "Choose section" : "Choose batch first"}</option>
                                        {availableSections.map(section => <option key={section.section_id} value={section.section_id}>{section.section_name}</option>)}
                                    </select>
                                </label>
                            </div>
                            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
                            <button type="submit" disabled={submitting || loadingOptions || !batches.length || !availableSections.length} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60">
                                {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={16} />}
                                {submitting ? "Submitting…" : "Submit application"}
                            </button>
                        </form>
                        <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">A login account and student record are created only after the HOD approves your application. Approved students receive the current default student password and should change it after signing in.</p>
                    </>
                )}
            </section>
        </main>
    );
}
