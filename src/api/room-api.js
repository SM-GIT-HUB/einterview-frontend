import api from "../lib/axios"

export async function getRooms(type)
{
    const response =
        await api.get(
            `/room/my-rooms?type=${type}`
        )

    return response.data;
}

export async function createRoom(data)
{
    const response =
        await api.post(
            "/room/create",
            data
        )

    return response.data;
}