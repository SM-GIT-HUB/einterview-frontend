/**
 * auth-api.js — einterview-frontend
 * Points to the unified backend (Final_Year_Project-Backend)
 * which uses the evision auth routes.
 */
import api from "../lib/axios"

// Step 1: send OTP
export async function sendOtp(data)
{
    const response = await api.post("/auth/signup/manual", data);
    return response.data;
}

// Step 2: verify OTP and create account
export async function signup(data)
{
    const response = await api.post("/auth/signup/manual/verify", data);
    return response.data;
}

export async function login(data)
{
    const response = await api.post("/auth/login/manual", data);
    return response.data;
}

export async function me()
{
    const response = await api.get("/auth/me");
    return response.data;
}

export async function logout()
{
    const response = await api.post("/auth/logout");
    return response.data;
}