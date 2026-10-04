import { Outlet, useOutletContext } from "react-router-dom";

import Navbar from "../components/navBar/navbar";
import Header from "../components/header/header";

const DashboardLayout = () => {

    const user = useOutletContext();

    return (
        <div className="h-screen flex overflow-hidden dark:bg-gray-800 dark:text-white">

            {/* Navbar */}
            <Navbar user={user} />

            {/* Right side */}
            <div className="flex flex-col flex-1 min-w-0 min-h-0">

                {/* Header */}
                <Header user={user} />

                {/* Scrollable main content */}
                <main className="flex-1 min-h-0 overflow-y-auto">
                    <Outlet context={user} />
                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;