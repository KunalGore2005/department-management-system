import React, { useState, useEffect } from 'react';
import { Trash, X } from 'lucide-react';

const Notice = (props) => {
    const [expanded, setExpanded] = useState(false);
    const [user, setUser] = useState(null);

    const priorityColor = {
        LOW: 'bg-green-500',
        MEDIUM: 'bg-yellow-500',
        HIGH: 'bg-red-500'
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/me`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (response.status === 401) {
                    setUser(null);
                    return;
                }

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();

                if (data.authenticated && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }

            } catch (error) {
                console.error("Authentication check failed:", error);
                setUser(null);
            }
        };

        checkAuthentication();
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/notices/${id}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (response.ok) {
                setExpanded(false);
                props.onDelete(id);
            }

        } catch (error) {
            console.error('Error deleting notice:', error);
        }
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

                        {/* Delete Notice*/}
                        {
                            user && (user.role === 'HOD' || user.role === 'Faculty') && (
                                <div className="mt-4 shrink-0 border-t p-5 pt-3 dark:border-gray-600">
                                    <button
                                        onClick={() => handleDelete(props.id)}
                                        className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                                    >
                                        <Trash size={16} className="inline-block mr-2" />
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            )}
        </>
    );
};

export default Notice;