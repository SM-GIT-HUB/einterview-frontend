import { useState }
from "react"

import { useNavigate }
from "react-router-dom"

import toast from "react-hot-toast"

import { createRoom }
from "../api/room-api"

function CreateRoomPage()
{
    const navigate = useNavigate();

    const [form, setForm] =
        useState({
            name: "",
            participantEmail: "",
            startTime: "",
            endTime: ""
        })

    async function handleSubmit(e)
    {
        e.preventDefault();

        try {

            await createRoom(form);

            toast.success(
                "Room created"
            )

            navigate("/home");
        }
        catch(err) {
            toast.error(
                err.response?.data?.message
                || "Failed to create room"
            )
        }
    }

    return (
        <div className="
            min-h-screen
            bg-zinc-950
            text-white
            flex items-center
            justify-center
            px-6
        ">

            <div className="
                w-full
                max-w-xl
                bg-zinc-900
                border border-zinc-800
                rounded-3xl
                p-8
            ">

                <h1 className="
                    text-4xl
                    font-bold
                ">
                    Create Room
                </h1>

                <p className="
                    mt-3
                    text-zinc-400
                ">
                    Schedule a new interview session
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="
                        mt-8
                    "
                >

                    <input
                        type="text"
                        placeholder="Room name"
                        value={
                            form.name
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                name:
                                    e.target.value
                            })
                        }
                        className="
                            w-full
                            bg-zinc-950
                            border border-zinc-800
                            rounded-xl
                            px-4 py-3
                            outline-none
                        "
                    />

                    <input
                        type="email"
                        placeholder="Participant email"
                        value={
                            form.participantEmail
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                participantEmail:
                                    e.target.value
                            })
                        }
                        className="
                            w-full
                            bg-zinc-950
                            border border-zinc-800
                            rounded-xl
                            px-4 py-3
                            outline-none
                        "
                    />

                    <input
                        type="datetime-local"
                        value={
                            form.startTime
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                startTime:
                                    e.target.value
                            })
                        }
                        className="
                            mt-5
                            w-full
                            bg-zinc-950
                            border border-zinc-800
                            rounded-xl
                            px-4 py-3
                            outline-none
                        "
                    />

                    <input
                        type="datetime-local"
                        value={
                            form.endTime
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                endTime:
                                    e.target.value
                            })
                        }
                        className="
                            mt-5
                            w-full
                            bg-zinc-950
                            border border-zinc-800
                            rounded-xl
                            px-4 py-3
                            outline-none
                        "
                    />

                    <button
                        type="submit"
                        className="
                            mt-6
                            w-full
                            bg-white
                            text-black
                            py-3
                            rounded-xl
                            font-semibold
                        "
                    >
                        Create Room
                    </button>

                </form>

            </div>

        </div>
    )
}

export default CreateRoomPage