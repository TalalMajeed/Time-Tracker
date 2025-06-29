import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { formatDistanceToNow } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

function App() {
    const [isTracking, setIsTracking] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [sessions, setSessions] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const intervalRef = useRef(null);

    // Timer effect
    useEffect(() => {
        if (isTracking) {
            intervalRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isTracking]);

    // Fetch system information periodically
    useEffect(() => {
        const fetchSystemInfo = async () => {
            try {
                const runningProcesses = await invoke("get_running_processes");
                setProcesses(runningProcesses);

                const cursorPos = await invoke("get_cursor_position");
                setCursorPosition(cursorPos);
            } catch (error) {
                console.error("Error fetching system info:", error);
            }
        };

        fetchSystemInfo();
        const interval = setInterval(fetchSystemInfo, 100);

        return () => clearInterval(interval);
    }, []);

    const handleStart = () => {
        setIsTracking(true);
        setStartTime(new Date());
        setElapsedTime(0);
    };

    const handleStop = () => {
        setIsTracking(false);
        const endTime = new Date();

        const newSession = {
            id: uuidv4(),
            startTime: startTime,
            endTime: endTime,
            duration: elapsedTime,
            processes: processes.map((p) => p.name),
        };

        setSessions((prev) => [newSession, ...prev.slice(0, 4)]); // Keep last 5 sessions
        setStartTime(null);
        setElapsedTime(0);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const formatMemory = (bytes) => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    return (
        <div className="app">
            <div className="header">
                <h1>Time Tracker</h1>
                <div className="timer">
                    <span className="time-display">
                        {formatTime(elapsedTime)}
                    </span>
                </div>
            </div>

            <div className="controls">
                <button
                    className={`control-btn ${isTracking ? "stop" : "start"}`}
                    onClick={isTracking ? handleStop : handleStart}
                >
                    {isTracking ? "Stop Tracking" : "Start Tracking"}
                </button>
            </div>

            {isTracking && (
                <div className="info-section">
                    <div className="info-card">
                        <h3>Cursor Position</h3>
                        <p>
                            X: {cursorPosition.x}, Y: {cursorPosition.y}
                        </p>
                    </div>

                    <div className="info-card">
                        <h3>Running Applications</h3>
                        <div className="process-list">
                            {processes.length > 0 ? (
                                processes.map((process, index) => (
                                    <div
                                        key={process.pid}
                                        className="process-item"
                                    >
                                        <span className="process-name">
                                            {process.name}
                                        </span>
                                        <span className="process-memory">
                                            {formatMemory(process.memory_usage)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No processes found</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="sessions-section">
                <h3>Recent Sessions</h3>
                <div className="sessions-list">
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <div key={session.id} className="session-item">
                                <div className="session-header">
                                    <span className="session-duration">
                                        {formatTime(session.duration)}
                                    </span>
                                    <span className="session-time">
                                        {formatDistanceToNow(
                                            session.startTime,
                                            { addSuffix: true }
                                        )}
                                    </span>
                                </div>
                                <div className="session-processes">
                                    {session.processes
                                        .slice(0, 2)
                                        .map((process, index) => (
                                            <span
                                                key={index}
                                                className="process-tag"
                                            >
                                                {process}
                                            </span>
                                        ))}
                                    {session.processes.length > 2 && (
                                        <span className="process-tag">
                                            +{session.processes.length - 2} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">No sessions yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
