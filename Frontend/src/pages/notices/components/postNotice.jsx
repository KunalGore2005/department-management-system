import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const PostNotice = ({ onSuccess }) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/notices`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ title, description, priority })
                }
            );

            const data = await response.json();

            if(response.ok) {
                console.log("Notice posted successfully:", data);
                toast.success("Notice posted successfully!");
            }
            else {
                throw new Error(data.message || 'Failed to post notice');
            }

            setTitle("");
            setDescription("");
            setPriority("");

            onSuccess?.();

            navigate("/notices");

        } catch (error) {
            console.error('Error posting notice:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-2 justify-center items-center p-4 dark:bg-black'
        >
            <input
                className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                type="text"
                placeholder='Title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <textarea
                className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />

            <select
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
            >
                <option value="">Select Priority</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
            </select>

            <button
                type="submit"
                disabled={loading}
                className='flex justify-center bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-2 px-4 my-2 rounded w-[90%] h-10'
            >
                {loading ? "Posting..." : "Post"}
            </button>
        </form>
    );
};

export default PostNotice;