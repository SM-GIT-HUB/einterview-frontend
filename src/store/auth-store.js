import { create } from "zustand"

const useAuthStore = create((set) => ({

    user: null,

    isAuthenticated: false,

    loading: true,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user
        }),

    setLoading: (loading) =>
        set({ loading })
}))

export default useAuthStore