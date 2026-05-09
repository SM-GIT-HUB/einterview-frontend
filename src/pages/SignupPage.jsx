import { useState } from "react"

import { Link, useNavigate }
from "react-router-dom"

import toast from "react-hot-toast"

import { signup } from "../api/auth-api"

import useAuthStore
from "../store/auth-store"

function SignupPage()
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
                await signup(form);

            setUser(response.data);

            toast.success(
                "Signup successful"
            )

            navigate("/");
        }
        catch(err) {

            toast.error(
                err.response?.data?.message
                || "Signup failed"
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
                        Create Account
                    </h1>

                    <p className="
                        mt-3
                        text-zinc-400
                    ">
                        Start conducting collaborative technical interviews
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
                            placeholder="Create a password"
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
                        Signup
                    </button>

                    <p className="
                        mt-6
                        text-center
                        text-zinc-400
                    ">
                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="
                                text-white
                                hover:text-violet-400
                                transition
                            "
                        >
                            Login
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    )
}

export default SignupPage