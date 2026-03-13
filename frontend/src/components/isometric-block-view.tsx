"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type BlockStatus = "vacant" | "occupied" | "repair" | "cleaning";

export interface CubicBlock {
    id: string;
    status: BlockStatus;
    label: string; // e.g., "1", "2"
    x: number; // grid x
    y: number; // grid y
    z?: number; // height (stacking) - default 0
}

interface IsometricBlockViewProps {
    blocks: CubicBlock[];
    floorSize?: number; // e.g. 4x4
}

export function IsometricBlockView({ blocks, floorSize = 4 }: IsometricBlockViewProps) {
    const [scale, setScale] = useState(1);

    // 2D Isometric Projection Constants
    // Base sizes
    const BASE_TILE_WIDTH = 80;
    const BASE_TILE_HEIGHT = 45;

    // Responsive State
    const [tileWidth, setTileWidth] = useState(BASE_TILE_WIDTH);
    const [tileHeight, setTileHeight] = useState(BASE_TILE_HEIGHT);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) { // Mobile
                setTileWidth(50);
                setTileHeight(28);
            } else {
                setTileWidth(BASE_TILE_WIDTH);
                setTileHeight(BASE_TILE_HEIGHT);
            }
        };

        handleResize(); // Init
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Center the grid in the container
    // We assume a virtual container width to center within
    const VIRTUAL_WIDTH = tileWidth * 8; // Roughly enough space
    const CENTER_X = 0; // We will translate to center via CSS
    const TOP_OFFSET = 50;

    return (
        <div className="w-full h-[400px] flex items-center justify-center overflow-hidden bg-slate-50/50 rounded-3xl border border-slate-100 relative">

            <div className="relative w-full h-full flex items-center justify-center">
                {/* Floor Glow */}
                <div
                    className="absolute w-[300px] h-[300px] bg-slate-100/50 rounded-full blur-3xl"
                />

                {/* Container for blocks that stays centered */}
                <div className="relative" style={{ marginTop: -50 }}>
                    {blocks
                        .slice()
                        .sort((a, b) => (a.x + a.y) - (b.x + b.y))
                        .map((block) => (
                            <BlockItem
                                key={block.id}
                                {...block}
                                tileWidth={tileWidth}
                                tileHeight={tileHeight}
                                centerX={0} // Relative to this centered container
                                topOffset={0}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}

function BlockItem({
    status,
    label,
    x,
    y,
    tileWidth,
    tileHeight,
    centerX,
    topOffset
}: CubicBlock & { tileWidth: number, tileHeight: number, centerX: number, topOffset: number }) {

    // Isometric Projection Formula
    // screenX = (x - y) * (width / 2)
    // screenY = (x + y) * (height / 2)
    const screenX = centerX + (x - y) * (tileWidth / 2);
    const screenY = topOffset + (x + y) * (tileHeight / 2);

    // Block visual properties
    const BLOCK_HEIGHT = 40; // Height of the cube extrusion

    // Colors
    const colorMap = {
        vacant: {
            top: "#10b981", // emerald-500
            side: "#059669", // emerald-600
            front: "#047857", // emerald-700
            text: "white"
        },
        occupied: {
            top: "#ef4444", // red-500
            side: "#dc2626", // red-600
            front: "#b91c1c", // red-700
            text: "white"
        },
        repair: {
            top: "#f59e0b", // amber-500
            side: "#d97706", // amber-600
            front: "#b45309", // amber-700
            text: "white"
        },
        cleaning: {
            top: "#3b82f6", // blue-500
            side: "#2563eb", // blue-600
            front: "#1d4ed8", // blue-700
            text: "white"
        }
    };
    const c = colorMap[status];

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: (x + y) * 0.05
            }}
            className="absolute"
            style={{
                left: screenX,
                top: screenY,
                width: tileWidth,
                height: tileHeight + BLOCK_HEIGHT, // Total visual height
                marginLeft: -tileWidth / 2, // Center the anchor point
                marginTop: -tileHeight / 2,
                zIndex: Math.floor((x + y) * 10), // Depth sorting
            }}
        >
            <div className="relative w-full h-full">
                {/* Block SVG Construction */}
                <svg width={tileWidth} height={tileHeight + BLOCK_HEIGHT} viewBox={`0 0 ${tileWidth} ${tileHeight + BLOCK_HEIGHT}`} className="drop-shadow-xl hover:drop-shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">

                    {/* Top Face (Rhombus) */}
                    <path
                        d={`M0 ${tileHeight / 2} L${tileWidth / 2} 0 L${tileWidth} ${tileHeight / 2} L${tileWidth / 2} ${tileHeight} Z`}
                        fill={c.top}
                    />

                    {/* Left Face */}
                    <path
                        d={`M0 ${tileHeight / 2} L${tileWidth / 2} ${tileHeight} L${tileWidth / 2} ${tileHeight + BLOCK_HEIGHT} L0 ${tileHeight / 2 + BLOCK_HEIGHT} Z`}
                        fill={c.front}
                    />

                    {/* Right Face */}
                    <path
                        d={`M${tileWidth / 2} ${tileHeight} L${tileWidth} ${tileHeight / 2} L${tileWidth} ${tileHeight / 2 + BLOCK_HEIGHT} L${tileWidth / 2} ${tileHeight + BLOCK_HEIGHT} Z`}
                        fill={c.side}
                    />

                    {/* Text Label on Top */}
                    <text
                        x={tileWidth / 2}
                        y={tileHeight / 2 + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                    >
                        {label}
                    </text>

                    {/* Status Indicator Dot (Optional) */}
                    {/* <circle cx={tileWidth/2} cy={tileHeight/2 - 10} r="3" fill="white" opacity="0.8" /> */}
                </svg>
            </div>
        </motion.div>
    );
}
