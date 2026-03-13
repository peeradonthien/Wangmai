"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BlockStatus } from "@/components/isometric-block-view";

// Re-defining types to match backend for now (or import shared types if monorepo)
export interface Fixture {
    id: string;
    type: 'toilet' | 'urinal' | 'sink';
    status: BlockStatus;
    x: number;
    y: number;
}

export interface Floor {
    id: number;
    name: string;
    vacancyRate: number;
    fixtures: Fixture[];
}

// Initial Static Data (so UI renders immediately)
const INITIAL_FLOORS: Floor[] = [
    {
        id: 1,
        name: "Male Restroom",
        vacancyRate: 100,
        fixtures: [
            // Toilets
            { id: "t1", type: "toilet", status: "vacant", x: 0, y: 0 },
            { id: "t2", type: "toilet", status: "vacant", x: 1, y: 0 },
            // Urinals
            { id: "u1", type: "urinal", status: "vacant", x: 0, y: 2 }
        ]
    }
];

export function useRestroomStatus(restroomId: string) {
    const [floors, setFloors] = useState<Floor[]>(INITIAL_FLOORS);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [peopleCount, setPeopleCount] = useState<number>(0);

    useEffect(() => {
        // Connect to Backend
        // Default to Render URL if env var is missing (for ease of use)
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "https://smart-bathroom-iot.onrender.com";
        console.log("Connecting to Socket URL:", socketUrl);

        const socket: Socket = io(socketUrl, {
            transports: ["websocket", "polling"], // Try websocket first, fall back to polling
            reconnectionAttempts: 5,
        });

        socket.on("connect", () => {
            console.log("Connected to Socket.io backend:", socket.id);
            setIsConnected(true);
            setError(null);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket Connection Error:", err.message);
            setError(`Connection Failed: ${err.message}`);
            setIsConnected(false);
        });

        socket.on("disconnect", (reason) => {
            console.log("Disconnected from Socket.io backend:", reason);
            setIsConnected(false);
        });

        // Listen for initial data (if the backend still sends this)
        socket.on("initial_state", (data: Floor[]) => {
            console.log("Received initial state:", data);
            setFloors(data);
        });

        // Listen for real-time updates from MQTT -> Socket bridge
        // Payload: { bathroom1Occupied: bool, bathroom2Occupied: bool, urinalOccupied: bool, peopleCount: number }
        socket.on("update", (data: any) => {
            console.log("Received update payload:", data); // Debug log active

            // Update People Count
            if (typeof data.peopleCount === 'number') {
                setPeopleCount(data.peopleCount);
            }

            // Map Backend Keys to Fixture IDs
            const updates = [
                { key: 'bathroom1Occupied', id: 't1' },
                { key: 'bathroom2Occupied', id: 't2' },
                { key: 'urinalOccupied', id: 'u1' }
            ];

            setFloors((currentFloors) => {
                // We'll update the floors immutably
                // Note: deeply cloning might be safer but map/map is fine for shallow depth
                return currentFloors.map(floor => {
                    let hasChanges = false;
                    let newFixtures = [...floor.fixtures];

                    updates.forEach(({ key, id }) => {
                        const statusVal = data[key];
                        // strict check for boolean or 0/1, assuming true/1 = occupied
                        if (statusVal === undefined) return;

                        const isOccupied = statusVal === true || statusVal === 1 || statusVal === 'true';
                        const newStatus: BlockStatus = isOccupied ? "occupied" : "vacant";

                        const fIndex = newFixtures.findIndex(f => f.id === id);
                        if (fIndex !== -1 && newFixtures[fIndex].status !== newStatus) {
                            newFixtures[fIndex] = { ...newFixtures[fIndex], status: newStatus };
                            hasChanges = true;
                        }
                    });

                    if (!hasChanges) return floor;

                    // Recalculate vacancy rate
                    const total = newFixtures.filter(f => f.type !== 'sink').length;
                    const vacant = newFixtures.filter(f => f.type !== 'sink' && f.status === 'vacant').length;
                    const rate = total > 0 ? Math.round((vacant / total) * 100) : 0;

                    return {
                        ...floor,
                        fixtures: newFixtures,
                        vacancyRate: rate
                    };
                });
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [restroomId]);

    return { floors, isConnected, error, peopleCount };
}
