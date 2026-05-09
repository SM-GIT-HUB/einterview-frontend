import api from "../lib/axios"

export async function signup(data)
{
    const response =
        await api.post(
            "/auth/signup",
            data
        )

    return response.data;
}

export async function login(data)
{
    const response =
        await api.post(
            "/auth/login",
            data
        )

    return response.data;
}

export async function me()
{
    const response =
        await api.get("/auth/me")

    return response.data;
}

export async function logout()
{
    const response =
        await api.post("/auth/logout")

    return response.data;
}