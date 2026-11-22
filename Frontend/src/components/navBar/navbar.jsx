import React, { useState } from 'react'
import Nav from './nav'
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { studentNavigation, hodNavigation, facultyNavigation } from '../../config/navigation'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const navbar = ({user}) => {

  const [expanded, setExpanded] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to log out. Please try again.");
      }

      toast.success("Logged out successfully.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

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
    <div>
      {!expanded && (
          <button
              className="md:hidden fixed top-3 left-3 z-50"
              onClick={() => setExpanded(true)}
          >
              ☰
          </button>
      )}
      <div
        className={`
          flex flex-col p-2 h-screen shrink-0
          justify-between border-r
          border-blue-200
          transition-all duration-300

          ${expanded ? "w-64" : "hidden md:flex md:w-12"}

          dark:bg-gray-800 dark:text-white dark:border-gray-700
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
                  <ChevronLeft size={20} className='cursor-pointer'/>
                  ) : (
                  <ChevronRight size={20} className='cursor-pointer'/>
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
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label={loggingOut ? "Logging out" : "Logout"}
                className={`
                  flex items-center rounded py-2 px-4
                  hover:bg-red-800 hover:text-white hover:font-medium
                  disabled:cursor-wait disabled:opacity-60
                  ${expanded ? "gap-3" : "justify-center"}
                `}
              >
                <LogOut size={18} className="shrink-0" />

                {expanded && (
                  <span>{loggingOut ? "Logging out…" : "Logout"}</span>
                )}
        </button>

      </div>
    </div>
  )
}

export default navbar;
