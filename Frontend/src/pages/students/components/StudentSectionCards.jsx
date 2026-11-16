import { Users, GraduationCap } from 'lucide-react';

const StudentSectionCards = ({ batches, sections, students, onSelect }) => (
    <div className="space-y-8">
        {batches.map((batch) => {
            const batchSections = sections.filter((section) => Number(section.batch_id) === Number(batch.batch_id));
            if (!batchSections.length) return null;
            return (
                <section key={batch.batch_id}>
                    <div className="mb-4 flex items-center gap-2">
                        <GraduationCap size={20} className="text-blue-900 dark:text-blue-400" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Admission Batch {batch.admission_year}</h2>
                        <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200">{batchSections.length} Sections</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {batchSections.map((section) => {
                            const count = students.filter((student) => Number(student.section_id) === Number(section.section_id) && Number(student.batch_id) === Number(section.batch_id)).length;
                            return (
                                <button key={`${section.batch_id}-${section.section_id}`} type="button" onClick={() => onSelect(section)} className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-4 text-left shadow-md transition hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500">
                                    <div className="flex items-start justify-between gap-3">
                                        <div><h3 className="text-xl font-bold text-gray-800 dark:text-white">Section {section.section_name}</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Batch {section.admission_year}</p></div>
                                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">View students</span>
                                    </div>
                                    <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300"><span className="flex items-center gap-2"><Users size={17} />{count} students</span><span className="text-xs text-gray-500">Intake {section.intake_strength ?? '—'}</span></div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            );
        })}
    </div>
);

export default StudentSectionCards;
