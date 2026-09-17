import React from 'react'
import { NavLink } from 'react-router-dom'

const nav = ({ symbol: Icon, name, path, expanded }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
          `
          flex items-center rounded py-2 px-4 my-2
          transition-all duration-200
          ${expanded ? "gap-3" : "justify-center"}
          ${
              isActive
                  ? "bg-blue-900 text-white font-medium"
                  : "hover:bg-blue-200"
          }
          `
      }
    >
      {/* Icon */}
            <Icon
                size={20}
                className="shrink-0"
            />

            {/* Name */}
            {expanded && (
                <span className="truncate">
                    {name}
                </span>
            )}
    </NavLink>
    
  )
}

export default nav