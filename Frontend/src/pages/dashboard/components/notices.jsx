import React, { useState } from 'react';
import { X } from 'lucide-react';

const Notice = (props) => {
    const [expanded, setExpanded] = useState(false);

    const priorityColor = {
        LOW: 'bg-green-500',
        MEDIUM: 'bg-yellow-500',
        HIGH: 'bg-red-500'
    };

    return (
        <>
            {/* Notice Card */}
            <div
                className="w-full min-w-0 overflow-hidden rounded-lg bg-white p-3 shadow-md cursor-pointer dark:bg-gray-800"
                onClick={() => setExpanded(true)}
            >
                <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="min-w-0 font-semibold wrap-anywhere">
                        {props.title}
                    </div>

                    <div
                        className={`h-3 w-3 shrink-0 rounded-full ${priorityColor[props.priority] || 'bg-gray-400'
                            }`}
                    />
                </div>

                {/* Collapsed Description */}
                <p className="mt-2 line-clamp-1 min-w-0 wrap-anywhere">
                    {props.description}
                </p>
            </div>

            {/* Modal */}
            {expanded && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setExpanded(false)}
                >
                    <div
                        className="flex max-h-[85vh] w-full max-w-lg min-w-0 flex-col rounded-xl bg-white shadow-xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header: does not scroll */}
                        <div className="flex shrink-0 items-start justify-between gap-3 p-5 pb-3">
                            <h2 className="min-w-0 wrap-anywhere text-xl font-bold">
                                {props.title}
                            </h2>

                            <button
                                onClick={() => setExpanded(false)}
                                className="shrink-0 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                                aria-label="Close notice"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Only this section scrolls */}
                        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-5">
                            <p className="whitespace-pre-wrap wrap-anywhere">
                                {props.description}
                            </p>
                        </div>

                        {/* Footer: does not scroll */}
                        <div className="mt-4 shrink-0 border-t p-5 pt-3 dark:border-gray-600">
                            <p>
                                Priority: {props.priority || 'Unknown'}
                            </p>

                            <p className="mt-2 wrap-anywhere">
                                Posted by: {props.postedBy}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Notice;