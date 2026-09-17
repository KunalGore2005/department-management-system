import React, {useState} from 'react'
import Nav from './nav'
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { studentNavigation, hodNavigation, facultyNavigation } from '../../config/navigation'

const navbar = ({user}) => {

  const [expanded, setExpanded] = useState(true);

  let navigation = [];
  const role = user?.role?.toUpperCase();

  if (role === "STUDENT") {
      navigation = studentNavigation;
  } else if (role === "FACULTY") {
      navigation = facultyNavigation;
  } else if (role === "HOD") {
      navigation = hodNavigation;
  } else {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <h1>Invalid user role</h1>
          </div>
      );
  }
  return (
    <div
      className={`
          flex flex-col p-2 min-h-screen shrink-0
          justify-between
          border-r
          border-blue-200
          transition-all duration-300
          ${expanded ? "w-64" : "w-20"}
      `}
    >

      <div>
        {/* Logo */}
        <div className={`
              flex items-center h-10 mb-4
              ${expanded ? "justify-between px-2" : "justify-center w-10"}
            `}>

              {expanded && <div className='flex justify-center items-center h-10'>logo</div>}

              <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-2 rounded"
              >
                {expanded ? (
                <ChevronLeft size={20} />
                ) : (
                <ChevronRight size={20} />
                )}
              </button>
        </div>

        {/* Navigation Items */}
        <div>
              {navigation.map((item, index) => (
                <div key={index}>
                  <Nav symbol={item.symbol} name={item.name} path={item.path} expanded={expanded} />
                </div>
              ))}
        </div>

      </div>

      {/* LogOut */}
      <button
              className={`
                flex items-center rounded py-2 px-4
                hover:bg-red-800 hover:text-white hover:font-medium
                ${expanded ? "gap-3" : "justify-center"}
              `}
            >
              <LogOut size={18} className="shrink-0" />

              {expanded && (
                <span>Logout</span>
              )}
      </button>

    </div>
  )
}

export default navbar;