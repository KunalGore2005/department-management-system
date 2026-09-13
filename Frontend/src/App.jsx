import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/login";
import ForgotPassword from "./pages/auth/forgotPassword";
import ResetPassword from "./pages/auth/resetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layout/dashboardLayout";

function App() {
    return (
            <Routes>

                {/* Public routes */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/forgotpassword"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/resetpassword"
                    element={<ResetPassword />}
                />


                {/* Protected dashboard */}

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            {(user) => (
                                <DashboardLayout user={user} />
                            )}
                        </ProtectedRoute>
                    }
                />

            </Routes>
    );
}

export default App;