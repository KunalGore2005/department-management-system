import Notice from '../../../components/notices/notices';
import useNotices from './useNotices';

const AllNotices = () => {
    const { noticeData, setNoticeData, loading, error } = useNotices();

    if (loading) {
        return <p>Loading notices...</p>;
    }

    if (error) {
        return <p>Failed to load notices: {error}</p>;
    }

    if (noticeData.length === 0) {
        return <p>No notices available.</p>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                All Notices
            </h1>
            <div className="mt-2 flex w-full min-w-0 flex-col gap-3">
                {noticeData.map((data) => (
                    <Notice
                        key={data.notice_id}
                        id={data.notice_id}
                        title={data.title}
                        description={data.description}
                        priority={data.priority}
                        postedBy={data.posted_by_name}
                        onDelete={(id) => {
                            setNoticeData(prev =>
                                prev.filter(notice => notice.notice_id !== id)
                            );
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default AllNotices;