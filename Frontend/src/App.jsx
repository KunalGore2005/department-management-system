import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/login";
import ForgotPassword from "./pages/auth/forgotPassword";
import ResetPassword from "./pages/auth/resetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import DashboardLayout from "./layout/dashboardLayout";
import ModuleRouter from "./routes/ModuleRouter";

function App() {

    return (
        <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>

                <Route element={<DashboardLayout />}>

                    <Route
                        path="/"
                        element={<ModuleRouter module="dashboard" />}
                    />

                    <Route
                        path="/attendance"
                        element={<ModuleRouter module="attendance" />}
                    />

                    <Route
                        path="/marks"
                        element={<ModuleRouter module="marks" />}
                    />

                    <Route
                        path="/notices"
                        element={<ModuleRouter module="notices" />}
                    />

                </Route>

            </Route>

        </Routes>
    );
}

export default App;