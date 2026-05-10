/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Editor from "@monaco-editor/react"
import toast from "react-hot-toast"
import { io } from "socket.io-client"
import { LogOut, Code2, Users, LayoutPanelLeft, PhoneOff, Video, Mic, MicOff, VideoOff, Settings, AlertCircle, Save, CheckCircle2, MonitorUp } from "lucide-react"

import api from "../lib/axios"
import { updateRoomNotes, updateInterviewScore } from "../api/room-api"
import useAuthStore from "../store/auth-store"

function RoomPage() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const { user } = useAuthStore();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");

    // examiner-only panel
    const [notes, setNotes] = useState("");
    const [score, setScore] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [savingScore, setSavingScore] = useState(false);
    const [panelTab, setPanelTab] = useState("video"); // "video" | "notes"
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const isRemoteChange = useRef(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteScreenRef = useRef(null);
    const [remoteScreenActive, setRemoteScreenActive] = useState(false);
    const peerConnection = useRef(null);
    const screenConnection = useRef(null);
    const localStream = useRef(null);
    const socketRef = useRef(null);
    const offerCreated = useRef(false);
    const screenStream = useRef(null);

    const [code, setCode] = useState(() => {
        const saved = localStorage.getItem(`room-code-${roomId}`)
        return saved || "// Write your solution here...\n\nfunction solve() {\n  \n}\n"
    })

    async function setupWebRTC(socket) {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        })

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            localStream.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            stream.getTracks().forEach(track => { peerConnection.current.addTrack(track, stream) })
        } catch {
            toast.error("Camera/Mic unavailable. Joining as viewer.")
            peerConnection.current.addTransceiver("video", { direction: "recvonly" })
            peerConnection.current.addTransceiver("audio", { direction: "recvonly" })
        }

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        }

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) socket.emit("ice-candidate", { roomId, candidate: event.candidate })
        }

        socket.on("peer-joined", async () => {
            if (offerCreated.current) return;
            if (peerConnection.current.signalingState !== "stable") return;
            offerCreated.current = true;
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer)
            socket.emit("offer", { roomId, offer })
        })

        socket.on("receive-offer", async (offer) => {
            if (peerConnection.current.signalingState !== "stable") return;
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer)
            socket.emit("answer", { roomId, answer })
        })

        socket.on("receive-answer", async (answer) => {
            if (!peerConnection.current.currentRemoteDescription) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
            }
        })

        socket.on("receive-ice-candidate", async (candidate) => {
            try { await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)) } catch(err) { console.log(err); }
        })

        socket.on("peer-left", () => {
            if (peerConnection.current) {
                peerConnection.current.ontrack = null;
                peerConnection.current.onicecandidate = null;
                peerConnection.current.close();
                peerConnection.current = null;
            }
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            
            if (screenConnection.current) {
                screenConnection.current.close();
                screenConnection.current = null;
            }
            if (remoteScreenRef.current) remoteScreenRef.current.srcObject = null;
            setRemoteScreenActive(false);

            offerCreated.current = false;
            peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => { peerConnection.current.addTrack(track, localStream.current); });
            }
            peerConnection.current.ontrack = (event) => { if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = event.streams[0]; } };
            peerConnection.current.onicecandidate = (event) => { if (event.candidate) { socket.emit("ice-candidate", { roomId, candidate: event.candidate }); } };
        })

        // Secondary Screen Connection Handlers
        socket.on("screen-receive-offer", async (offer) => {
            screenConnection.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
            screenConnection.current.ontrack = e => {
                if (remoteScreenRef.current) remoteScreenRef.current.srcObject = e.streams[0];
                setRemoteScreenActive(true);
            };
            screenConnection.current.onicecandidate = e => {
                if (e.candidate) socket.emit("screen-ice-candidate", { roomId, candidate: e.candidate });
            };
            await screenConnection.current.setRemoteDescription(offer);
            const answer = await screenConnection.current.createAnswer();
            await screenConnection.current.setLocalDescription(answer);
            socket.emit("screen-answer", { roomId, answer });
        });

        socket.on("screen-receive-answer", async (answer) => {
            if (screenConnection.current) await screenConnection.current.setRemoteDescription(answer);
        });

        socket.on("screen-receive-ice-candidate", async (candidate) => {
            if (screenConnection.current) await screenConnection.current.addIceCandidate(candidate);
        });

        socket.on("screen-stop", () => {
            if (remoteScreenRef.current) remoteScreenRef.current.srcObject = null;
            setRemoteScreenActive(false);
            if (screenConnection.current) screenConnection.current.close();
            screenConnection.current = null;
        });
    }

    useEffect(() => {
        async function fetchRoom() {
            try {
                const response = await api.get(`/room/${roomId}`)
                const roomData = response.data.data;
                const now = Date.now();
                const end = new Date(roomData.endTime).getTime();
                if (now >= end) return navigate("/room-finished")
                setRoom(roomData);
                setNotes(roomData.notes || "");
                setScore(roomData.interviewScore ?? "");
            } catch(err) {
                toast.error(err.response?.data?.message || "Failed to load room")
                navigate("/home");
            } finally {
                setLoading(false);
            }
        }
        fetchRoom();
    }, [roomId])

    useEffect(() => {
        if (!room) return;
        setIsReconnecting(true);
        const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", { withCredentials: true })
        socketRef.current = socket;
        
        socket.on("connect", () => setIsReconnecting(false));
        socket.on("disconnect", () => setIsReconnecting(true));

        socket.emit("join-room", roomId)
        socket.on("code-update", (incomingCode) => {
            isRemoteChange.current = true;
            setCode(incomingCode);
        })
        setupWebRTC(socket);

        return () => {
            socket.off("code-update");
            socket.off("peer-joined");
            socket.off("receive-offer");
            socket.off("receive-answer");
            socket.off("receive-ice-candidate");
            socket.off("screen-receive-offer");
            socket.off("screen-receive-answer");
            socket.off("screen-receive-ice-candidate");
            socket.off("screen-stop");
            socket.disconnect();
            if (peerConnection.current) { peerConnection.current.close(); peerConnection.current = null; }
            if (screenConnection.current) { screenConnection.current.close(); screenConnection.current = null; }
            if (localStream.current) { localStream.current.getTracks().forEach(track => track.stop()); localStream.current = null; }
            offerCreated.current = false;
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            if (remoteScreenRef.current) remoteScreenRef.current.srcObject = null;
        }
    }, [room])

    useEffect(() => { localStorage.setItem(`room-code-${roomId}`, code) }, [code, roomId])

    useEffect(() => {
        if (!room) return;
        const interval = setInterval(() => {
            const now = Date.now();
            const end = new Date(room.endTime).getTime();
            const difference = end - now;
            if (difference <= 0) {
                clearInterval(interval);
                navigate("/room-finished")
                return;
            }
            const hours = Math.floor(difference / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)
            setTimeLeft(`${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`)
        }, 1000)
        return () => clearInterval(interval);
    }, [room])

    function handleChange(value) {
        const updatedCode = value || "";
        setCode(updatedCode);
        if (isRemoteChange.current) { isRemoteChange.current = false; return; }
        socketRef.current?.emit("code-change", { roomId, code: updatedCode })
    }

    async function saveNotes() {
        setSavingNotes(true);
        try { await updateRoomNotes(roomId, notes); toast.success("Notes saved"); }
        catch { toast.error("Failed to save notes"); }
        finally { setSavingNotes(false); }
    }

    async function saveScore() {
        const num = Number(score);
        if (isNaN(num) || num < 0) return toast.error("Enter a valid score");
        setSavingScore(true);
        try { await updateInterviewScore(roomId, num); toast.success("Interview score saved"); }
        catch { toast.error("Failed to save score"); }
        finally { setSavingScore(false); }
    }

    const toggleMic = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; setMicEnabled(audioTrack.enabled); }
        }
    }

    const toggleCamera = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            if (videoTrack) { videoTrack.enabled = !videoTrack.enabled; setCameraEnabled(videoTrack.enabled); }
        }
    }

    async function toggleScreenShare() {
        if (!isScreenSharing) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStream.current = stream;
                
                screenConnection.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
                stream.getTracks().forEach(t => screenConnection.current.addTrack(t, stream));
                
                screenConnection.current.onicecandidate = e => {
                    if (e.candidate) socketRef.current.emit("screen-ice-candidate", { roomId, candidate: e.candidate });
                };
                
                const offer = await screenConnection.current.createOffer();
                await screenConnection.current.setLocalDescription(offer);
                socketRef.current.emit("screen-offer", { roomId, offer });
                
                setIsScreenSharing(true);
                stream.getVideoTracks()[0].onended = () => stopScreenShare();
            } catch(err) {
                toast.error("Screen share cancelled");
            }
        } else {
            stopScreenShare();
        }
    }

    function stopScreenShare() {
        if (screenStream.current) {
            screenStream.current.getTracks().forEach(t => t.stop());
            screenStream.current = null;
        }
        if (screenConnection.current) {
            screenConnection.current.close();
            screenConnection.current = null;
        }
        socketRef.current?.emit("screen-stop", roomId);
        setIsScreenSharing(false);
    }

    if (loading) return null;

    return (
        <div className="h-screen w-screen bg-[#000000] text-zinc-100 flex flex-col font-sans overflow-hidden selection:bg-violet-500/30">
            {/* --- Floating Top Navigation --- */}
            <header className="h-14 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 relative z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-violet-400">
                        <Code2 size={20} strokeWidth={2.5} />
                        <span className="font-bold text-lg tracking-tight text-white">EVision IDE</span>
                    </div>
                    <div className="h-4 w-px bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-zinc-300">{room?.name || "Interview Room"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Reconnection Status */}
                    {isReconnecting && (
                        <div className="flex items-center gap-2 text-amber-500 text-sm font-medium animate-pulse">
                            <AlertCircle size={16} /> Reconnecting...
                        </div>
                    )}
                    
                    {/* Timer */}
                    <div className="flex items-center gap-2 font-mono text-sm bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-lg text-emerald-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        {timeLeft}
                    </div>

                    <button 
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                    >
                        <PhoneOff size={16} /> Leave Room
                    </button>
                </div>
            </header>

            {/* --- Main Split Pane --- */}
            <main className="flex-1 flex overflow-hidden relative">
                
                {/* Background ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Left Pane: Code Editor */}
                <div className="flex-1 flex flex-col min-w-[60%] border-r border-white/5 relative z-10 bg-[#000000]">
                    <div className="h-12 border-b border-white/5 bg-[#09090b] flex items-center px-5 gap-3 shadow-sm">
                        <div className="flex gap-1.5 mr-4">
                            <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                            <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                            <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/5 border-b-0 rounded-t-lg text-xs font-mono text-zinc-300">
                            <Code2 size={14} className="text-violet-400" /> main.js
                        </div>
                    </div>
                    <div className={`flex-1 relative ${remoteScreenActive ? "h-1/2 border-b border-white/5" : "h-full"}`}>
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            defaultLanguage="javascript"
                            value={code}
                            onChange={handleChange}
                            loading={<div className="flex items-center justify-center h-full text-zinc-500 font-mono text-sm">Initializing Monaco...</div>}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 15,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                fontLigatures: true,
                                padding: { top: 24, bottom: 24 },
                                lineNumbersMinChars: 3,
                                lineDecorationsWidth: 20,
                                renderLineHighlight: "all",
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: "on",
                                smoothScrolling: true,
                                formatOnPaste: true,
                            }}
                        />
                    </div>
                    {remoteScreenActive && (
                        <div className="h-1/2 relative bg-[#09090b] flex flex-col group overflow-hidden">
                            <div className="absolute top-3 left-3 bg-violet-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg z-20 backdrop-blur-md shadow-lg flex items-center gap-2 border border-violet-500">
                                <MonitorUp size={14} /> Candidate Screen
                            </div>
                            <video ref={remoteScreenRef} autoPlay playsInline className="w-full h-full object-contain bg-[#050505]" />
                        </div>
                    )}
                </div>

                {/* Right Pane: Video & Tools */}
                <div className="w-[450px] flex flex-col bg-[#050505]/95 backdrop-blur-3xl relative z-20 shadow-[-30px_0_60px_rgba(0,0,0,0.8)] border-l border-white/5">
                    
                    {/* Tab Navigation */}
                    <div className="flex p-3 border-b border-white/5 gap-3 bg-black/50">
                        <button onClick={() => setPanelTab("video")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${panelTab === "video" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"}`}>
                            <Users size={14} /> Workspace
                        </button>
                        {user?.role === "examiner" && (
                            <button onClick={() => setPanelTab("notes")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${panelTab === "notes" ? "bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/30" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"}`}>
                                <LayoutPanelLeft size={14} /> Evaluation
                            </button>
                        )}
                    </div>

                    {/* Video Workspace View */}
                    <div className={`flex-1 flex-col overflow-y-auto p-5 gap-5 ${panelTab === "video" ? "flex" : "hidden"}`}>
                        
                        {/* Remote Video (Large) */}
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group shadow-lg">
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-violet-600 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold shadow-lg">
                                    P
                                </div>
                                <span className="text-sm font-medium text-white drop-shadow-md">Peer</span>
                            </div>
                        </div>

                        {/* Local Video (PiP Style) */}
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group shadow-lg">
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold shadow-lg">
                                    Y
                                </div>
                                <span className="text-sm font-medium text-white drop-shadow-md">You</span>
                            </div>

                            {/* Floating Media Controls */}
                            <div className="absolute top-3 right-3 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
                                <button onClick={toggleScreenShare} className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-xl ${isScreenSharing ? "bg-violet-600 border-violet-500 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`} title="Share Screen">
                                    <MonitorUp size={16} />
                                </button>
                                <button onClick={toggleMic} className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-xl ${micEnabled ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-red-500/90 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"}`}>
                                    {micEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                                </button>
                                <button onClick={toggleCamera} className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-xl ${cameraEnabled ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-red-500/90 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"}`}>
                                    {cameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle size={18} className="text-violet-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-violet-200/70 leading-relaxed">
                                Code changes are synced in real-time. Video and audio streams are end-to-end encrypted via WebRTC.
                            </p>
                        </div>
                    </div>

                    {/* Examiner Evaluation View */}
                    {user?.role === "examiner" && (
                        <div className={`flex-1 flex-col overflow-y-auto p-5 gap-6 ${panelTab === "notes" ? "flex" : "hidden"}`}>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Save size={14} /> Interview Notes
                                </label>
                                <textarea
                                    className="w-full h-48 bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 resize-none transition-all placeholder:text-zinc-700 font-mono"
                                    placeholder="> Write objective observations here..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                                <button onClick={saveNotes} disabled={savingNotes} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {savingNotes ? "Saving..." : "Update Notes"}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={14} /> Final Score
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full bg-[#000000] border border-white/10 rounded-xl px-5 py-4 text-2xl font-black text-emerald-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-zinc-800 shadow-inner"
                                        placeholder="0-100"
                                        value={score}
                                        onChange={e => setScore(e.target.value)}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-lg">/ 100</span>
                                </div>
                                <button onClick={saveScore} disabled={savingScore} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 mt-4 flex justify-center">
                                    {savingScore ? "Committing..." : "Finalize Selection Score"}
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default RoomPage