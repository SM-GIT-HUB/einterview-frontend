import { useEffect, useState }
from "react"

import { useNavigate }
from "react-router-dom"

import toast from "react-hot-toast"

import { getRooms }
from "../api/room-api"

function HomePage()
{
    const navigate = useNavigate();

    const [activeTab,
        setActiveTab] =
        useState("upcoming");

    const [upcomingRooms,
        setUpcomingRooms] =
        useState([]);

    const [pastRooms,
        setPastRooms] =
        useState([]);

    async function fetchRooms()
    {
        try {

            const upcoming =
                await getRooms(
                    "upcoming"
                );

            const past =
                await getRooms(
                    "past"
                );

            setUpcomingRooms(
                upcoming.data
            )

            setPastRooms(
                past.data
            )
        }
        catch {

            toast.error(
                "Failed to fetch rooms"
            )
        }
    }

    useEffect(() => {

        async function load()
        {
            await fetchRooms();
        }

        load();

    }, [])

    function handleJoin(room)
    {
        const now =
            new Date().getTime();

        const start =
            new Date(
                room.startTime
            ).getTime();

        if (now < start)
        {
            return toast.error(
                "Interview has not started yet"
            )
        }

        navigate(
            `/room/${room.roomId}`
        )
    }

    return (
        <div className="
            min-h-screen
            bg-zinc-950
            text-white
        ">

            <div className="
                max-w-6xl
                mx-auto
                px-6
                py-10
            ">

                <div className="
                    flex items-center
                    justify-between
                ">

                    <div>

                        <h1 className="
                            text-4xl
                            font-bold
                        ">
                            Interview Dashboard
                        </h1>

                        <p className="
                            mt-2
                            text-zinc-400
                        ">
                            Manage interview rooms
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                "/create-room"
                            )
                        }
                        className="
                            bg-white
                            text-black
                            px-5 py-3
                            rounded-xl
                            font-semibold
                        "
                    >
                        Create Room
                    </button>

                </div>

                <div className="
                    mt-10
                    flex items-center
                    gap-4
                ">

                    <button
                        onClick={() =>
                            setActiveTab(
                                "upcoming"
                            )
                        }
                        className={`
                            px-5 py-2.5
                            rounded-xl
                            transition
                            ${
                                activeTab
                                === "upcoming"
                                ? "bg-white text-black"
                                : "bg-zinc-900 text-white"
                            }
                        `}
                    >
                        Upcoming Rooms
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab(
                                "past"
                            )
                        }
                        className={`
                            px-5 py-2.5
                            rounded-xl
                            transition
                            ${
                                activeTab
                                === "past"
                                ? "bg-white text-black"
                                : "bg-zinc-900 text-white"
                            }
                        `}
                    >
                        Past Rooms
                    </button>

                </div>

                <div className="
                    mt-10
                    grid gap-5
                ">

                    {
                        activeTab
                        === "upcoming"
                        &&
                        (
                            upcomingRooms.length
                            === 0
                        )
                        &&
                        (
                            <div className="
                                bg-zinc-900
                                border border-zinc-800
                                rounded-2xl
                                p-10
                                text-center
                                text-zinc-400
                            ">
                                No rooms available
                            </div>
                        )
                    }

                    {
                        activeTab
                        === "past"
                        &&
                        (
                            pastRooms.length
                            === 0
                        )
                        &&
                        (
                            <div className="
                                bg-zinc-900
                                border border-zinc-800
                                rounded-2xl
                                p-10
                                text-center
                                text-zinc-400
                            ">
                                No rooms available
                            </div>
                        )
                    }

                    {
                        activeTab
                        === "upcoming"
                        &&
                        upcomingRooms.map(
                            (room) => (

                            <div
                                key={room._id}
                                className="
                                    bg-zinc-900
                                    border border-zinc-800
                                    rounded-2xl
                                    p-6
                                    flex items-center
                                    justify-between
                                "
                            >

                                <div>

                                    <p className="
                                        text-zinc-400
                                        text-sm
                                    ">
                                        {
                                            room.participantEmail
                                        }
                                    </p>

                                    <h2 className="
                                        mt-2
                                        text-2xl
                                        font-semibold
                                    ">
                                        {room.name}
                                    </h2>

                                    <p className="
                                        mt-3
                                        text-zinc-500
                                        text-sm
                                    ">
                                        Starts:
                                        {" "}
                                        {
                                            new Date(
                                                room.startTime
                                            ).toLocaleString()
                                        }
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        handleJoin(
                                            room
                                        )
                                    }
                                    className="
                                        bg-white
                                        text-black
                                        px-5 py-2.5
                                        rounded-xl
                                        font-semibold
                                    "
                                >
                                    Join Room
                                </button>

                            </div>
                        ))
                    }

                    {
                        activeTab
                        === "past"
                        &&
                        pastRooms.map(
                            (room) => (

                            <div
                                key={room._id}
                                className="
                                    bg-zinc-900
                                    border border-zinc-800
                                    rounded-2xl
                                    p-6
                                    flex items-center
                                    justify-between
                                "
                            >

                                <div>

                                    <p className="
                                        text-zinc-400
                                        text-sm
                                    ">
                                        {
                                            room.participantEmail
                                        }
                                    </p>

                                    <h2 className="
                                        mt-2
                                        text-2xl
                                        font-semibold
                                    ">
                                        {room.name}
                                    </h2>

                                    <p className="
                                        mt-3
                                        text-red-400
                                        text-sm
                                    ">
                                        This room is over
                                    </p>

                                </div>

                                <div className="
                                    text-zinc-500
                                    font-medium
                                ">
                                    Closed
                                </div>

                            </div>
                        ))
                    }

                </div>

            </div>

        </div>
    )
}

export default HomePage