import api from "../lib/axios"

export async function getRooms(type)
{
    const response = await api.get(`/room/my-rooms${type ? `?type=${type}` : ""}`);
    return response.data;
}

export async function getRoom(roomId)
{
    const response = await api.get(`/room/${roomId}`);
    return response.data;
}

export async function createRoom(data)
{
    const response = await api.post("/room/create", data);
    return response.data;
}

export async function updateRoomNotes(roomId, data)
{
    const response = await api.patch(`/room/${roomId}/notes`, data);
    return response.data;
}

export async function updateInterviewScore(roomId, data)
{
    const response = await api.patch(`/room/${roomId}/score`, data);
    return response.data;
}