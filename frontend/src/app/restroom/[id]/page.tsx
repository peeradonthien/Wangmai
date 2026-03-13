"use client";

import { IsometricBlockView, CubicBlock, BlockStatus } from "@/components/isometric-block-view";
import { ChevronLeft, Bookmark, Activity, Users, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRestroomStatus } from "@/hooks/use-restroom-status";
import { Badge } from "@/components/ui/badge";

import { AnimatePresence, motion } from "framer-motion";

function EntranceAnimation({ show }: { show: boolean }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-10 left-[-40px] z-20"
                >
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                            <Users size={16} className="text-white" />
                        </div>
                        <span className="bg-white/90 text-[10px] px-2 py-0.5 rounded-full shadow-sm mt-1 font-bold text-blue-600">
                            +1
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function RestroomDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { floors, isConnected, peopleCount } = useRestroomStatus(id);
    const [activeFloorId, setActiveFloorId] = useState(1);
    const [showEntranceAnim, setShowEntranceAnim] = useState(false);
    const [prevPeopleCount, setPrevPeopleCount] = useState(peopleCount);

    // Trigger animation when peopleCount increases
    useEffect(() => {
        if (peopleCount > prevPeopleCount) {
            setShowEntranceAnim(true);
            const timer = setTimeout(() => setShowEntranceAnim(false), 2000);
            return () => clearTimeout(timer);
        }
        setPrevPeopleCount(peopleCount);
    }, [peopleCount, prevPeopleCount]);

    const activeFloor = floors.find(f => f.id === activeFloorId) || floors[0];

    // Transform fixtures to blocks for the new view
    const blocks: CubicBlock[] = useMemo(() => {
        if (!activeFloor) return [];
        return activeFloor.fixtures.map((f, index) => ({
            id: f.id,
            status: f.status as BlockStatus,
            label: (index + 1).toString(),
            x: f.x,
            y: f.y,
            z: 0
        }));
    }, [activeFloor]);

    if (!activeFloor) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    {!isConnected && !floors.length ? (
                        <>
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                            <p className="text-slate-500 font-medium">Connecting to server...</p>
                            <p className="text-xs text-slate-400">({process.env.NEXT_PUBLIC_SOCKET_URL || "smart-bathroom-iot.onrender.com"})</p>
                        </>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Nav Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                            <ChevronLeft size={24} className="text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">วิศวกรรมศาสตร์ ตึก 3</h1>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                {isConnected ? <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> : <span className="w-2 h-2 rounded-full bg-amber-500" />}
                                {isConnected ? "Live Status" : "Offline / Simulated"}
                            </p>
                        </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
                        <Bookmark size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 pt-24 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Isometric View (Main Focus) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-8 flex items-center justify-center min-h-[500px] relative">
                        <div className="absolute top-6 left-6 z-10">
                            <h2 className="text-2xl font-bold">{activeFloor.name}</h2>
                            <p className="text-slate-500">Men&apos;s Restroom</p>
                        </div>

                        {/* Legend */}
                        <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2 bg-white/90 p-3 rounded-xl border border-slate-100 backdrop-blur-sm text-xs font-medium">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Vacant</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm" /> Occupied</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-sm" /> Maintenance</div>
                        </div>

                        <EntranceAnimation show={showEntranceAnim} />

                        <IsometricBlockView blocks={blocks} floorSize={4} />
                    </div>
                </div>

                {/* Right Column: Controls & Stats */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Floor Selector Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-semibold mb-4 text-slate-900">Select Floor</h3>
                        <div className="space-y-3">
                            {floors.map((floor) => {
                                const isVacant = floor.vacancyRate > 50;
                                const isActive = activeFloorId === floor.id;
                                return (
                                    <button
                                        key={floor.id}
                                        onClick={() => setActiveFloorId(floor.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden",
                                            isActive
                                                ? "border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.02]"
                                                : "border-slate-100 hover:border-slate-300 bg-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
                                                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                                            )}>
                                                {floor.id}
                                            </div>
                                            <div className="text-left">
                                                <div className={cn("font-bold text-lg", isActive ? "text-white" : "text-slate-800")}>
                                                    {floor.name}
                                                </div>
                                                <div className={cn("text-xs", isActive ? "text-slate-300" : "text-slate-500")}>
                                                    {isVacant ? "Available" : "Crowded"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <div className={cn("text-2xl font-black",
                                                isActive ? "text-white" : (isVacant ? "text-emerald-500" : "text-red-500")
                                            )}>
                                                {floor.vacancyRate}%
                                            </div>
                                            <div className={cn("text-[10px] uppercase tracking-wider opacity-70", isActive ? "text-slate-300" : "text-slate-400")}>
                                                Availability
                                            </div>
                                        </div>

                                        {/* Progress Bar Background */}
                                        <div
                                            className={cn(
                                                "absolute bottom-0 left-0 h-1 transition-all duration-500",
                                                isActive ? "bg-emerald-400" : isVacant ? "bg-emerald-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${floor.vacancyRate}%`, opacity: isActive ? 1 : 0.8 }}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex flex-col items-center justify-center text-emerald-900">
                            <Users className="w-6 h-6 mb-2 opacity-80" />
                            <span className="text-2xl font-bold">{peopleCount}</span>
                            <span className="text-xs opacity-70">People Total</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col items-center justify-center text-blue-900">
                            <Clock className="w-6 h-6 mb-2 opacity-80" />
                            <span className="text-2xl font-bold">&lt; 2m</span>
                            <span className="text-xs opacity-70">Avg Wait</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

// Force rebuild (peopleCount fix)
