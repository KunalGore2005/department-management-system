import React, { useState, useEffect } from 'react'
import Stats from './components/stats'
import Notice from './components/notices';

const hod = () => {
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
    <div className='flex h-full w-full p-4 dark:bg-black '>

      <div className='flex-1'>

        <div className='text-xl'>
          {dashboardData?.profile?.name && (
            <p>Welcome, <span className='font-semibold'>{dashboardData.profile.name}</span></p>
          )}
        </div>

        <div>
          <h1 className='text-3xl font-bold'>Head Of Department</h1>
          <p className='font-medium '>Manage Your Department</p>
        </div>


        <div className="w-full min-w-0 overflow-x-hidden">

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full min-w-0 py-3">
            <Stats title="Total Students" value={dashboardData?.statistics?.totalStudents} />
            <Stats title="Total Faculties" value={dashboardData?.statistics?.totalFaculty} />
            <Stats title="Total Subjects" value={dashboardData?.statistics?.totalSubjects} />
            <Stats title="Total Notices" value={dashboardData?.statistics?.totalNotices} />
          </div>

          <div className='w-1/4 pr-2'>
            <Stats title="Active Attendance Sessions" value={dashboardData?.statistics?.activeAttendanceSessions} />
          </div>

          {/* Recent Notices */}
          <div className="w-1/2 min-w-0 pt-4">
            <h1 className='font-bold text-2xl'>Recent Notices</h1>

            <div className="mt-2 flex w-full min-w-0 flex-col gap-3">
              {dashboardData?.recentNotices?.length > 0 && dashboardData?.recentNotices?.map((notice, index) => (
                <Notice
                  key={notice._id || index}
                  title={notice.title}
                  description={notice.description}
                  priority={notice.priority}
                  postedBy={notice.posted_by_name}
                />
              ))}
              {
                dashboardData?.recentNotices?.length == 0 && <div>No Notices</div>
              }
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default hod