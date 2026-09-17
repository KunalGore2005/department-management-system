import Navbar from "../components/navBar/navbar";
import DashboardRouter from "../pages/dashboard/dashboardRouter";
import Header from "../components/header/header";

const DashboardLayout = ({ user }) => {
    return (
        <div className="min-h-screen flex">

            <Navbar user={user} />

            <main className="flex-1">
                <Header user={user}/>
                <DashboardRouter user={user} />
            </main>

        </div>
    );
};

export default DashboardLayout;