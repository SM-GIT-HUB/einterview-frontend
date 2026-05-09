/* eslint-disable react-hooks/exhaustive-deps */
import {
    useEffect,
    useRef,
    useState
} from "react"

import {
    useNavigate,
    useParams
} from "react-router-dom"

import Editor
from "@monaco-editor/react"

import toast from "react-hot-toast"

import { io }
from "socket.io-client"

import api from "../lib/axios"

function RoomPage()
{
    const navigate = useNavigate();

    const { roomId } =
        useParams();

    const [room, setRoom] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [timeLeft, setTimeLeft] =
        useState("");

    const isRemoteChange =
        useRef(false);

    const localVideoRef =
        useRef(null);

    const remoteVideoRef =
        useRef(null);

    const peerConnection =
        useRef(null);

    const localStream =
        useRef(null);

    const socketRef =
        useRef(null);

    const offerCreated =
        useRef(false);

    const [code, setCode] =
        useState(() => {

            const saved =
                localStorage.getItem(
                    `room-code-${roomId}`
                )

            return (
                saved
                || "// Start coding..."
            )
        })

    async function setupWebRTC(socket)
    {
        peerConnection.current =
            new RTCPeerConnection({

                iceServers: [
                    {
                        urls:
                            "stun:stun.l.google.com:19302"
                    }
                ]
            })

        try {

            const stream =
                await navigator
                .mediaDevices
                .getUserMedia({
                    video: true,
                    audio: true
                })

            localStream.current =
                stream;

            if (localVideoRef.current)
            {
                localVideoRef.current.srcObject =
                    stream;
            }

            stream
            .getTracks()
            .forEach(track => {

                peerConnection.current
                .addTrack(
                    track,
                    stream
                )
            })
        }
        catch {

            toast.error(
                "Camera unavailable. Joining as viewer."
            )

            peerConnection.current.addTransceiver(
                "video",
                { direction: "recvonly" }
            )

            peerConnection.current.addTransceiver(
                "audio",
                { direction: "recvonly" }
            )
        }

        peerConnection.current.ontrack = (event) => {

            if (remoteVideoRef.current)
            {
                remoteVideoRef.current.srcObject =
                    event.streams[0];
            }
        }

        peerConnection.current.onicecandidate =
            (event) => {

            if (event.candidate)
            {
                socket.emit(
                    "ice-candidate",
                    {
                        roomId,
                        candidate: event.candidate
                    }
                )
            }
        }

        socket.on(
            "peer-joined",
            async () => {

                if (offerCreated.current)
                {
                    return;
                }

                if (
                    peerConnection.current
                    .signalingState !== "stable"
                )
                {
                    return;
                }

                offerCreated.current = true;

                const offer =
                    await peerConnection.current.createOffer();

                await peerConnection.current.setLocalDescription(
                    offer
                )

                socket.emit(
                    "offer",
                    {
                        roomId,
                        offer
                    }
                )
            }
        )

        socket.on(
            "receive-offer",
            async (offer) => {

                if (
                    peerConnection.current
                    .signalingState !== "stable"
                )
                {
                    return;
                }

                await peerConnection.current.setRemoteDescription(
                    new RTCSessionDescription(
                        offer
                    )
                )

                const answer =
                    await peerConnection.current.createAnswer();

                await peerConnection.current.setLocalDescription(
                    answer
                )

                socket.emit(
                    "answer",
                    {
                        roomId,
                        answer
                    }
                )
            }
        )

        socket.on(
            "receive-answer",
            async (answer) => {

                if (
                    !peerConnection.current
                    .currentRemoteDescription
                )
                {
                    await peerConnection.current.setRemoteDescription(
                        new RTCSessionDescription(
                            answer
                        )
                    )
                }
            }
        )

        socket.on(
            "receive-ice-candidate",
            async (candidate) => {

                try {

                    await peerConnection.current.addIceCandidate(
                        new RTCIceCandidate(
                            candidate
                        )
                    )
                }
                catch(err) {

                    console.log(err);
                }
            }
        )
    }

    //
    // FETCH ROOM
    //
    useEffect(() => {

        async function fetchRoom()
        {
            try {

                const response =
                    await api.get(
                        `/room/${roomId}`
                    )

                const roomData =
                    response.data.data;

                const now =
                    Date.now();

                const end =
                    new Date(
                        roomData.endTime
                    ).getTime();

                if (now >= end)
                {
                    return navigate(
                        "/room-finished"
                    )
                }

                setRoom(roomData);
            }
            catch(err) {

                toast.error(
                    err.response?.data?.message
                    || "Failed to load room"
                )

                navigate("/home");
            }
            finally {

                setLoading(false);
            }
        }

        fetchRoom();

    }, [roomId])

    //
    // SOCKET + WEBRTC
    //
    useEffect(() => {

        if (!room) return;

        const socket =
            io("https://einterview.onrender.com", {
                withCredentials: true
            })

        socketRef.current = socket;

        socket.emit(
            "join-room",
            roomId
        )

        socket.on(
            "code-update",
            (incomingCode) => {

                isRemoteChange.current = true;
                setCode(incomingCode);
            }
        )

        setupWebRTC(socket);

        return () => {

            socket.off("code-update");
            socket.off("peer-joined");
            socket.off("receive-offer");
            socket.off("receive-answer");
            socket.off("receive-ice-candidate");

            socket.disconnect();

            if (peerConnection.current)
            {
                peerConnection.current.close();
                peerConnection.current = null;
            }

            if (localStream.current)
            {
                localStream.current
                .getTracks()
                .forEach(track => track.stop());

                localStream.current = null;
            }
        }

    }, [room])

    //
    // LOCAL STORAGE SAVE
    //
    useEffect(() => {

        localStorage.setItem(
            `room-code-${roomId}`,
            code
        )

    }, [code, roomId])

    //
    // TIMER
    //
    useEffect(() => {

        if (!room) return;

        const interval =
            setInterval(() => {

                const now = Date.now();

                const end =
                    new Date(
                        room.endTime
                    ).getTime();

                const difference =
                    end - now;

                if (difference <= 0)
                {
                    clearInterval(interval);

                    navigate(
                        "/room-finished"
                    )

                    return;
                }

                const hours =
                    Math.floor(
                        difference / (1000 * 60 * 60)
                    )

                const minutes =
                    Math.floor(
                        (
                            difference
                            % (1000 * 60 * 60)
                        ) / (1000 * 60)
                    )

                const seconds =
                    Math.floor(
                        (
                            difference
                            % (1000 * 60)
                        ) / 1000
                    )

                setTimeLeft(
                    `${hours}h ${minutes}m ${seconds}s`
                )

            }, 1000)

        return () =>
            clearInterval(interval);

    }, [room])

    function handleChange(value)
    {
        const updatedCode =
            value || "";

        setCode(updatedCode);

        if (isRemoteChange.current)
        {
            isRemoteChange.current = false;
            return;
        }

        socketRef.current?.emit(
            "code-change",
            {
                roomId,
                code: updatedCode
            }
        )
    }

    if (loading)
    {
        return null;
    }

    return (
        <div className="
            h-screen
            bg-zinc-950
            text-white
            flex flex-col
        ">

            <div className="
                px-6 py-4
                border-b border-zinc-800
                flex items-center
                justify-between
            ">

                <div>

                    <h1 className="
                        text-2xl
                        font-bold
                    ">
                        {room?.name}
                    </h1>

                    <p className="
                        mt-1
                        text-zinc-400
                        text-sm
                    ">
                        Room ID: {" "}
                        {roomId}
                    </p>

                </div>

                <div className="
                    bg-zinc-900
                    border border-zinc-800
                    rounded-xl
                    px-4 py-2
                    text-sm
                    font-medium
                ">
                    Time Left: {" "}
                    {timeLeft}
                </div>

            </div>

            <div className="
                flex-1
                grid
                grid-cols-[360px_1fr]
            ">

                <div className="
                    bg-black
                    border-r border-zinc-800
                    p-4
                    flex flex-col
                    gap-4
                ">

                    <div className="
                        relative
                        rounded-2xl
                        overflow-hidden
                        border border-zinc-800
                        bg-zinc-900
                        aspect-video
                    ">

                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="
                                w-full
                                h-full
                                object-cover
                            "
                        />

                        <div className="
                            absolute
                            bottom-3 left-3
                            bg-black/70
                            px-3 py-1
                            rounded-lg
                            text-sm
                        ">
                            You
                        </div>

                    </div>

                    <div className="
                        relative
                        rounded-2xl
                        overflow-hidden
                        border border-zinc-800
                        bg-zinc-900
                        aspect-video
                    ">

                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="
                                w-full
                                h-full
                                object-cover
                            "
                        />

                        <div className="
                            absolute
                            bottom-3 left-3
                            bg-black/70
                            px-3 py-1
                            rounded-lg
                            text-sm
                        ">
                            Participant
                        </div>

                    </div>

                </div>

                <div className="h-full">

                    <Editor
                        height="100%"
                        theme="vs-dark"
                        defaultLanguage="javascript"
                        value={code}
                        onChange={handleChange}
                        options={{
                            minimap: {
                                enabled: false
                            },

                            fontSize: 16,

                            automaticLayout: true,

                            scrollBeyondLastLine: false,

                            wordWrap: "on",

                            tabSize: 4,

                            autoClosingBrackets: "always",

                            autoClosingQuotes: "always",

                            autoIndent: "full",

                            formatOnPaste: false,

                            formatOnType: false,

                            quickSuggestions: false,

                            suggestOnTriggerCharacters: false,

                            glyphMargin: false,

                            lineNumbersMinChars: 3,

                            renderValidationDecorations: "off",

                            occurrencesHighlight: "off",

                            selectionHighlight: false,

                            hideCursorInOverviewRuler: true
                        }}
                    />

                </div>

            </div>

        </div>
    )
}

export default RoomPage