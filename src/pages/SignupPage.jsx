import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { sendOtp, signup } from "../api/auth-api"
import useAuthStore from "../store/auth-store"

function SignupPage()
{
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
        otp: "",
        role: "student"
    })

    async function handleSendOtp()
    {
        if (!form.email) return toast.error("Enter your email");
        try {
            setLoading(true);
            await sendOtp({ email: form.email, role: form.role });
            toast.success("OTP sent to your email");
            setStep(2);
        }
        catch(err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        }
        finally {
            setLoading(false);
        }
    }

    async function handleSubmit()
    {
        try {
            setLoading(true);
            const response = await signup(form);
            setUser(response.data);
            toast.success("Account created!");
            navigate("/home");
        }
        catch(err) {
            toast.error(err.response?.data?.message || "Signup failed");
        }
        finally {
            setLoading(false);
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
            <div className="w-full max-w-md">

                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Create Account
                    </h1>
                    <p className="mt-3 text-zinc-400">
                        Join the interview platform
                    </p>
                </div>

                <div className="
                    bg-zinc-900
                    border border-zinc-800
                    rounded-3xl
                    p-8
                    space-y-5
                ">
                    {/* Step 1: Email + Role */}
                    {step === 1 && (
                        <>
                            <div>
                                <label className="text-sm text-zinc-400 block mb-2">I am a...</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["student", "examiner"].map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, role: r }))}
                                            className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition
                                                ${form.role === r
                                                    ? "border-violet-500 bg-violet-500/20 text-violet-300"
                                                    : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-600"
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                                    className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                            >
                                {loading ? "Sending OTP..." : "Send OTP →"}
                            </button>
                        </>
                    )}

                    {/* Step 2: Password + OTP */}
                    {step === 2 && (
                        <>
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-400">
                                OTP sent to <span className="text-white">{form.email}</span>
                                {" "}
                                <button className="text-xs text-zinc-500 hover:text-white underline ml-1" onClick={() => setStep(1)}>
                                    Change
                                </button>
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400">Password</label>
                                <input
                                    type="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400">OTP</label>
                                <input
                                    type="text"
                                    placeholder="Enter OTP from email"
                                    value={form.otp}
                                    onChange={e => setForm(f => ({ ...f, otp: e.target.value }))}
                                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                    className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                            >
                                {loading ? "Creating account..." : "Create Account"}
                            </button>
                        </>
                    )}

                    <p className="text-center text-zinc-400 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-white hover:text-violet-400 transition">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignupPage