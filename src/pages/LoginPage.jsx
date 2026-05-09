import { useState } from "react"

import { Link, useNavigate }
from "react-router-dom"

import toast from "react-hot-toast"

import { login } from "../api/auth-api"

import useAuthStore
from "../store/auth-store"

function LoginPage()
{
    const navigate = useNavigate();

    const { setUser } =
        useAuthStore();

    const [form, setForm] =
        useState({
            email: "",
            password: ""
        })

    async function handleSubmit(e)
    {
        e.preventDefault();

        try {

            const response =
                await login(form);

            setUser(response.data);

            toast.success(
                "Login successful"
            )

            navigate("/");
        }
        catch(err) {

            toast.error(
                err.response?.data?.message
                || "Login failed"
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
                max-w-md
            ">

                <div className="
                    mb-8
                    text-center
                ">

                    <h1 className="
                        text-4xl
                        font-bold
                        tracking-tight
                    ">
                        Welcome Back
                    </h1>

                    <p className="
                        mt-3
                        text-zinc-400
                    ">
                        Login to continue your interview sessions
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="
                        bg-zinc-900
                        border border-zinc-800
                        rounded-3xl
                        p-8
                    "
                >

                    <div>

                        <label className="
                            text-sm
                            text-zinc-400
                        ">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email:
                                        e.target.value
                                })
                            }
                            className="
                                mt-2
                                w-full
                                bg-zinc-950
                                border border-zinc-800
                                rounded-xl
                                px-4 py-3
                                outline-none
                                focus:border-violet-500
                            "
                        />

                    </div>

                    <div className="mt-5">

                        <label className="
                            text-sm
                            text-zinc-400
                        ">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password:
                                        e.target.value
                                })
                            }
                            className="
                                mt-2
                                w-full
                                bg-zinc-950
                                border border-zinc-800
                                rounded-xl
                                px-4 py-3
                                outline-none
                                focus:border-violet-500
                            "
                        />

                    </div>

                    <button
                        type="submit"
                        className="
                            mt-8
                            w-full
                            bg-white
                            text-black
                            py-3
                            rounded-xl
                            font-semibold
                            hover:opacity-90
                            transition
                        "
                    >
                        Login
                    </button>

                    <p className="
                        mt-6
                        text-center
                        text-zinc-400
                    ">
                        Don&apos;t have an account?{" "}

                        <Link
                            to="/signup"
                            className="
                                text-white
                                hover:text-violet-400
                                transition
                            "
                        >
                            Signup
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    )
}

export default LoginPage