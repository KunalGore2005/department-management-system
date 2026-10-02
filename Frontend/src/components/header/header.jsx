import React from 'react'
import ThemeToggle from './themeToggle'

const Header = ({user}) => {
    if (!user) {
        return null;
    }
    const email=user.email;
    return (
        <div 
            className='flex w-full p-2 justify-between items-center h-12 border-b border-blue-200
             dark:border-gray-700 dark:bg-gray-800 dark:text-white'>
            <div>Logo</div>
            <div className='flex gap-2'>
                <div>{email}</div>
                <div>
                    <ThemeToggle/>
                </div>
            </div>
        </div>
  )
}

export default Header