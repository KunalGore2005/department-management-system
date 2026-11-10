import React, { useState, useEffect } from 'react'
import Stats from './components/stats';
import Notice from '../../components/notices/notices';

const faculty = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include"
          }
        );
        const data = await response.json();
        console.log("Dashboard Data:", data);
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch dashboard data');
        }
        setDashboardData(data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }
    fetchData();
  }, []);


  return (

    <div className='flex h-full w-full p-4 dark:bg-black'>

      <div className='flex-1'>

        <div className='text-xl'>
          {dashboardData?.profile?.name && (
            <p>Welcome, <span className='font-semibold'>{dashboardData.profile.name}</span></p>
          )}
        </div>

        <div>
          <h1 className='text-3xl font-bold'>Faculty</h1>
          <p className='font-medium '>Manage Your </p>
        </div>

        <div className='w-full min-w-0 overflow-x-hidden'>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full min-w-0 py-3">

            <Stats title="Total Subjects" value={dashboardData?.statistics?.totalSubjects} />
            <Stats title="Total Allocation" value={dashboardData?.statistics?.totalAllocations} />
            <Stats title="Total Attendance Session" value={dashboardData?.statistics?.totalAttendanceSessions} />
            <Stats title="Total Notices" value={dashboardData?.statistics?.totalNotices} />

          </div>

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

      </div>

    </div>
  )
}

export default faculty