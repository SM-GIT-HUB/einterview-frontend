import { useEffect } from "react"

import AppRoutes from "./routes/AppRoutes"

import { me } from "./api/auth-api"

import useAuthStore
from "./store/auth-store"

function App()
{
    const {
        setUser,
        setLoading
    } = useAuthStore();

    useEffect(() => {

        async function checkAuth()
        {
            try {

                const response =
                    await me();

                // unified backend: { success, message, data: user }
                setUser(response.data || response);
            }
            catch {

                setUser(null);
            }
            finally {

                setLoading(false);
            }
        }

        checkAuth();

    }, [])

    return <AppRoutes />
}

export default App