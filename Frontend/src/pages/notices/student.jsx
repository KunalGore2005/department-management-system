import React from 'react'
import AllNotices from './components/allNotices'

const student = () => {
  return (
    <div className='flex h-full w-full p-4 dark:bg-black '>
      <div className='flex-1'>
        <AllNotices/>
      </div>
    </div>
  )
}

export default student