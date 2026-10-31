import React, { useState, useEffect } from 'react';
import {
    UserRound,
    GraduationCap,
    BookOpen,
    CalendarCheck,
    CalendarX,
    ClipboardList,
    TrendingUp,
    Users,
    Percent
} from 'lucide-react';

import Notice from '../../components/notices/notices';

const Student = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/dashboard`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Failed to fetch dashboard data'
                    );
                }

                setDashboardData(data.data);
            } catch (error) {
                console.error('Error fetching student dashboard:', error);
                setError(error.message || 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                Failed to load dashboard: {error}
            </div>
        );
    }

    const profile = dashboardData?.profile;
    const attendance = dashboardData?.attendance;
    const marks = dashboardData?.marks;

    const attendancePercentage =
        Number(attendance?.attendancePercentage) || 0;

    const averagePercentage =
        Number(marks?.averagePercentage) || 0;

    const StatCard = ({
        title,
        value,
        subtitle,
        icon: Icon,
        iconColor = 'text-blue-600',
        iconBg = 'bg-blue-100'
    }) => (
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>

                    <p className="mt-2 wrap-break-words text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>

                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className={`shrink-0 rounded-lg p-2 ${iconBg}`}>
                    <Icon size={22} className={iconColor} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full min-w-0 w-full overflow-x-hidden p-4 dark:bg-black">

            {/* Welcome Section */}
            <div className="mb-5">
                <p className="text-xl text-gray-700 dark:text-gray-300">
                    Welcome,{' '}
                    <span className="font-semibold">
                        {profile?.name || 'Student'}
                    </span>
                </p>

                <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    Student Dashboard
                </h1>

                <p className="font-medium text-gray-500 dark:text-gray-400">
                    Track your attendance and academic performance
                </p>
            </div>

            {/* Student Profile */}
            <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center gap-2">
                    <UserRound
                        size={22}
                        className="text-blue-600 dark:text-blue-400"
                    />

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        My Profile
                    </h2>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="min-w-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Full Name
                        </p>

                        <p className="mt-1 wrap-break-words font-semibold text-gray-900 dark:text-white">
                            {profile?.name || 'N/A'}
                        </p>
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enrollment Number
                        </p>

                        <p className="mt-1 wrap-break-words font-semibold text-gray-900 dark:text-white">
                            {profile?.enrollmentNumber || 'N/A'}
                        </p>
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Section
                        </p>

                        <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                            {profile?.section?.sectionName || 'N/A'}
                        </p>
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Admission Batch
                        </p>

                        <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                            {profile?.batch?.admissionYear
                                ? `${profile.batch.admissionYear} - ${
                                      profile.batch.admissionYear + 4
                                  }`
                                : 'N/A'}
                        </p>
                    </div>

                </div>
            </div>

            {/* Attendance Statistics */}
            <section className="mb-6 min-w-0">
                <div className="mb-3 flex items-center gap-2">
                    <CalendarCheck
                        size={22}
                        className="text-blue-600 dark:text-blue-400"
                    />

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Attendance Overview
                    </h2>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <StatCard
                        title="Total Lectures"
                        value={attendance?.totalLectures ?? 0}
                        subtitle="Lectures conducted"
                        icon={BookOpen}
                    />

                    <StatCard
                        title="Attended Lectures"
                        value={attendance?.attendedLectures ?? 0}
                        subtitle="Lectures attended"
                        icon={CalendarCheck}
                        iconColor="text-green-600"
                        iconBg="bg-green-100"
                    />

                    <StatCard
                        title="Absent Lectures"
                        value={attendance?.absentLectures ?? 0}
                        subtitle="Lectures missed"
                        icon={CalendarX}
                        iconColor="text-red-600"
                        iconBg="bg-red-100"
                    />

                    <StatCard
                        title="Attendance Percentage"
                        value={`${attendancePercentage}%`}
                        subtitle="Overall attendance"
                        icon={Percent}
                        iconColor="text-purple-600"
                        iconBg="bg-purple-100"
                    />

                </div>

                {/* Attendance Progress */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Attendance Progress
                        </h3>

                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {attendancePercentage}%
                        </span>
                    </div>

                    <div
                        className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                        role="progressbar"
                        aria-label="Attendance percentage"
                        aria-valuenow={Math.min(
                            100,
                            Math.max(0, attendancePercentage)
                        )}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                attendancePercentage < 75
                                    ? 'bg-red-500'
                                    : 'bg-green-500'
                            }`}
                            style={{
                                width: `${Math.min(
                                    100,
                                    Math.max(0, attendancePercentage)
                                )}%`
                            }}
                        />
                    </div>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {Number(attendance?.totalLectures) === 0
                            ? 'No attendance records available yet.'
                            : attendancePercentage < 75
                              ? 'Your attendance is below 75%. Attend upcoming lectures regularly.'
                              : 'Your attendance is at or above 75%.'}
                    </p>
                </div>
            </section>

            {/* Academic Performance */}
            <section className="mb-6 min-w-0">
                <div className="mb-3 flex items-center gap-2">
                    <GraduationCap
                        size={23}
                        className="text-blue-600 dark:text-blue-400"
                    />

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Academic Performance
                    </h2>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">

                    <StatCard
                        title="Total Marks"
                        value={marks?.totalMarks ?? 0}
                        subtitle="Marks recorded in the system"
                        icon={ClipboardList}
                    />

                    <StatCard
                        title="Average Percentage"
                        value={`${averagePercentage}%`}
                        subtitle="Average academic performance"
                        icon={TrendingUp}
                        iconColor="text-green-600"
                        iconBg="bg-green-100"
                    />

                </div>
            </section>

            {/* Recent Notices */}
            <section className="mb-4 w-full min-w-0 md:w-1/2">
                <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Notices
                </h2>

                <div className="flex w-full min-w-0 flex-col gap-3">
                    {dashboardData?.recentNotices?.length > 0 ? (
                        dashboardData.recentNotices.map((notice) => (
                            <Notice
                                key={notice.notice_id}
                                title={notice.title}
                                description={notice.description}
                                priority={notice.priority}
                                postedBy={notice.posted_by_name}
                            />
                        ))
                    ) : (
                        <p className="rounded-lg bg-gray-100 p-4 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            No recent notices available.
                        </p>
                    )}
                </div>
            </section>

        </div>
    );
};

export default Student;
