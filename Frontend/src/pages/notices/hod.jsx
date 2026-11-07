import React, { useState } from 'react';
import AllNotices from './components/allNotices';
import PostNotice from './components/postNotice';
import { X } from 'lucide-react';

const Hod = () => {

  const [showPostNotice, setShowPostNotice] = useState(false);
  const [noticeRefreshKey, setNoticeRefreshKey] = useState(0);

  return (
    <div className='flex h-full w-full p-4 dark:bg-black'>
      <div className='flex-1'>
        <div>
          <button
            className='flex justify-center bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 my-2 rounded h-10'
            onClick={() => setShowPostNotice(true)}
          >
            + Post Notice
          </button>

          {showPostNotice && (
            <div className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'>
              <div className='w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg'>

                <div className='flex justify-between items-center p-5 pb-0'>
                  <h2 className='text-xl font-bold'>
                    Post Notice
                  </h2>

                  <button
                    className='text-gray-500 hover:text-gray-700'
                    onClick={() => setShowPostNotice(false)}
                  >
                    <X />
                  </button>
                </div>

                <PostNotice
                  onSuccess={() => {
                    setShowPostNotice(false);
                    setNoticeRefreshKey(prev => prev + 1);
                  }}
                />

              </div>
            </div>
          )}
        </div>

        <AllNotices key={noticeRefreshKey} />
      </div>
    </div>
  );
};

export default Hod;