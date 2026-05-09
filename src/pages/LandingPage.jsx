import { useNavigate } from "react-router-dom"

function LandingPage()
{
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            <nav className="
                border-b border-zinc-900
            ">

                <div className="
                    max-w-7xl mx-auto
                    px-6 py-5
                    flex items-center
                    justify-between
                ">

                    <h1 className="
                        text-2xl
                        font-bold
                        tracking-tight
                    ">
                        E-Interview
                    </h1>

                    <button
                        onClick={() =>
                            navigate("/login")
                        }
                        className="
                            bg-white
                            text-black
                            px-5 py-2.5
                            rounded-xl
                            font-medium
                            hover:opacity-90
                            transition
                        "
                    >
                        Login
                    </button>

                </div>

            </nav>

            <section className="
                max-w-7xl mx-auto
                px-6
                pt-28
                pb-24
                grid lg:grid-cols-2
                gap-20
                items-center
            ">

                <div>

                    <p className="
                        text-violet-400
                        font-medium
                        tracking-wide
                    ">
                        REAL-TIME INTERVIEW PLATFORM
                    </p>

                    <h1 className="
                        mt-6
                        text-6xl
                        leading-tight
                        font-bold
                        tracking-tight
                    ">
                        Secure technical interviews with collaborative coding
                    </h1>

                    <p className="
                        mt-8
                        text-zinc-400
                        text-lg
                        leading-relaxed
                        max-w-2xl
                    ">
                        Conduct live one-on-one technical
                        interviews with integrated video
                        communication and collaborative
                        coding sessions in real-time.
                    </p>

                    <div className="
                        mt-10
                        flex items-center
                        gap-5
                    ">

                        <button
                            onClick={() =>
                                navigate("/signup")
                            }
                            className="
                                bg-white
                                text-black
                                px-7 py-3
                                rounded-2xl
                                font-semibold
                                hover:opacity-90
                                transition
                            "
                        >
                            Get Started
                        </button>

                        <button
                            onClick={() =>
                                navigate("/login")
                            }
                            className="
                                border border-zinc-800
                                px-7 py-3
                                rounded-2xl
                                hover:bg-zinc-900
                                transition
                            "
                        >
                            Login
                        </button>

                    </div>

                </div>

                <div className="
                    bg-zinc-900/60
                    border border-zinc-800
                    rounded-3xl
                    p-8
                    backdrop-blur
                ">

                    <div className="
                        grid gap-6
                    ">

                        <div className="
                            bg-zinc-950
                            border border-zinc-800
                            rounded-2xl
                            p-6
                        ">

                            <h2 className="
                                text-xl
                                font-semibold
                            ">
                                Live Video Interviews
                            </h2>

                            <p className="
                                mt-3
                                text-zinc-400
                                leading-relaxed
                            ">
                                Conduct seamless face-to-face
                                technical interviews with
                                real-time communication.
                            </p>

                        </div>

                        <div className="
                            bg-zinc-950
                            border border-zinc-800
                            rounded-2xl
                            p-6
                        ">

                            <h2 className="
                                text-xl
                                font-semibold
                            ">
                                Collaborative Monaco Editor
                            </h2>

                            <p className="
                                mt-3
                                text-zinc-400
                                leading-relaxed
                            ">
                                Write and review code together
                                instantly with synchronized
                                collaborative editing.
                            </p>

                        </div>

                        <div className="
                            bg-zinc-950
                            border border-zinc-800
                            rounded-2xl
                            p-6
                        ">

                            <h2 className="
                                text-xl
                                font-semibold
                            ">
                                Scheduled Interview Rooms
                            </h2>

                            <p className="
                                mt-3
                                text-zinc-400
                                leading-relaxed
                            ">
                                Create time-based interview
                                rooms with participant access
                                control and invitations.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </div>
    )
}

export default LandingPage