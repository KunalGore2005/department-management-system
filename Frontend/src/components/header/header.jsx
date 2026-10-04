import React from 'react'
import ThemeToggle from './themeToggle'

const Header = ({user}) => {
    if (!user) {
        return null;
    }
    const email=user.email;
    return (
        <div
            className="grid grid-cols-3 w-full p-2 items-center h-12
                    border-b border-blue-200
                    dark:border-gray-700 dark:bg-gray-800 dark:text-white
                    md:flex md:justify-between">
            <div className="text-center md:text-left ">
                Logo
            </div>

            <div></div>

            <div className="flex gap-2 justify-end">
                <div className="hidden sm:flex">
                    {email}
                </div>

                <ThemeToggle />
            </div>
        </div>
  )
}

export default Header