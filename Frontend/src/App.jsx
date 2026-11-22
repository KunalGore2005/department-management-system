import { Routes, Route } from "react-router-dom";
import AppToaster from "./components/common/Toaster";

import Login from "./pages/auth/login";
import ForgotPassword from "./pages/auth/forgotPassword";
import ResetPassword from "./pages/auth/resetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";

import DashboardLayout from "./layout/dashboardLayout";
import ModuleRouter from "./routes/ModuleRouter";

function App() {

    return (
        <>
            <AppToaster />
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
                            path="/exams"
                            element={<ModuleRouter module="exams" />}
                        />

                        <Route
                            path="/notices"
                            element={<ModuleRouter module="notices" />}
                        />

                        <Route
                            path="/assign-coordinators"
                            element={<ModuleRouter module="coordinator" />}
                        />

                        <Route
                            path="/faculties"
                            element={<ModuleRouter module="faculty" />}
                        />

                        <Route
                            path="/subject-allocation"
                            element={<ModuleRouter module="subject-allocation" />}
                        />

                        <Route
                            path="/students"
                            element={<ModuleRouter module="students" />}
                        />

                        <Route
                            path="/section"
                            element={<ModuleRouter module="section" />}
                        />

                        <Route
                            path="/attendance"
                            element={<ModuleRouter module="attendance" />}
                        />

                        <Route
                            path="/settings"
                            element={<ModuleRouter module="settings" />}
                        />

                    </Route>

                </Route>

            </Routes>
        </>
    );
}

export default App;
