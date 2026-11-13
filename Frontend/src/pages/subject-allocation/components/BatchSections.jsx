import { Layers, Users, GraduationCap } from "lucide-react";

const BatchSections = ({
    batches = [],
    sections = [],
    selectedBatch,
    selectedSection,
    onBatchSelect,
    onSectionSelect
}) => {
    return (
        <div className="space-y-6">

            {/* Batch Selection */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3 dark:text-white">
                    Select Batch
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batches.map((batch) => (
                        <button
                            key={batch.batch_id}
                            onClick={() => onBatchSelect(batch.batch_id)}
                            className={`p-4 rounded-xl border text-left transition-all
                                ${
                                    Number(selectedBatch) === Number(batch.batch_id)
                                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 dark:bg-gray-700 dark:border-blue-500 dark:ring-blue-500"
                                        : "border-gray-200 bg-white hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                    <GraduationCap size={22} />
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        Batch {batch.admission_year}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Admission Year
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Section Selection */}
            {selectedBatch && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Layers size={19} className="text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Select Section
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sections.map((section) => (
                            <button
                                key={section.section_id}
                                onClick={() => onSectionSelect(section.section_id)}
                                className={`p-4 rounded-xl border text-left transition-all
                                    ${
                                        Number(selectedSection) === Number(section.section_id)
                                            ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600  dark:bg-gray-700 dark:border-blue-500 dark:ring-blue-500"
                                            : "border-gray-200 bg-white hover:border-indigo-300  dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500"
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">
                                            Section {section.section_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Batch {section.admission_year}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Users size={16} />
                                        {section.intake_strength}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {sections.length === 0 && (
                        <p className="text-sm text-gray-500">
                            No sections found for this batch.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BatchSections;