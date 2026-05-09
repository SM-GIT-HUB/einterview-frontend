import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom"

import HomePage from "../pages/HomePage"
import RoomPage from "../pages/RoomPage"
import LoginPage from "../pages/LoginPage"
import SignupPage from "../pages/SignupPage"
import LandingPage from "../pages/LandingPage"
import CreateRoomPage from "../pages/CreateRoomPage"
import RoomFinishedPage from "../pages/RoomFinishedPage"

import useAuthStore
from "../store/auth-store"

function AppRoutes()
{
    const {
        isAuthenticated,
        loading
    } = useAuthStore();

    if (loading)
    {
        return null;
    }

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        isAuthenticated
                        ? <Navigate to="/home" />
                        : <LandingPage />
                    }
                />

                <Route
                    path="/login"
                    element={
                        isAuthenticated
                        ? <Navigate to="/home" />
                        : <LoginPage />
                    }
                />

                <Route
                    path="/signup"
                    element={
                        isAuthenticated
                        ? <Navigate to="/home" />
                        : <SignupPage />
                    }
                />

                <Route
                    path="/home"
                    element={
                        isAuthenticated
                        ? <HomePage />
                        : <Navigate to="/" />
                    }
                />

                <Route
                    path="/create-room"
                    element={
                        isAuthenticated
                        ? <CreateRoomPage />
                        : <Navigate to="/" />
                    }
                />

                <Route
                    path="/room/:roomId"
                    element={
                        isAuthenticated
                        ? <RoomPage />
                        : <Navigate to="/" />
                    }
                />

                <Route
                    path="/room-finished"
                    element={
                        isAuthenticated
                        ? <RoomFinishedPage />
                        : <Navigate to="/" />
                    }
                />

            </Routes>

        </BrowserRouter>
    )
}

export default AppRoutes