import axios from "axios"

const api = axios.create({
    baseURL:
        "https://einterview.onrender.com/api/v1",

    withCredentials: true
})

export default api