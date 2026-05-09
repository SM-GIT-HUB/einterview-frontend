import { useNavigate }
from "react-router-dom"

function RoomFinishedPage()
{
    const navigate = useNavigate();

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
                p-10
                text-center
            ">

                <h1 className="
                    text-5xl
                    font-bold
                ">
                    Room Finished
                </h1>

                <p className="
                    mt-5
                    text-zinc-400
                    text-lg
                    leading-relaxed
                ">
                    This interview session
                    has ended.
                </p>

                <button
                    onClick={() =>
                        navigate("/home")
                    }
                    className="
                        mt-8
                        bg-white
                        text-black
                        px-6 py-3
                        rounded-xl
                        font-semibold
                    "
                >
                    Back to Dashboard
                </button>

            </div>

        </div>
    )
}

export default RoomFinishedPage