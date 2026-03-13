"use client";

export type StallStatus = "vacant" | "occupied" | "repair";
export type FixtureType = "toilet" | "urinal" | "sink";

export interface Fixture {
    id: string;
    type: FixtureType;
    status: StallStatus;
    x: number; // grid x
    y: number; // grid y
}

interface IsometricRestroomProps {
    fixtures: Fixture[];
}

export function IsometricRestroom({ fixtures }: IsometricRestroomProps) {
    // Simplified Isometric View: Just the floor plane and icons standing on it.
    // Isometric projection angle: 30 degrees.
    // We can use a CSS transform or SVG math. SVG is cleaner for positioning.

    const tileWidth = 60;
    const tileHeight = 35; // Flattened diamond shape
    const gridSize = 4; // Assume 4x4 grid mainly

    // Center of the view
    const centerX = 300;
    const topY = 50;

    return (
        <div className="w-full aspect-[4/3] relative flex items-center justify-center">
            <svg
                viewBox="0 0 600 450"
                className="w-full h-full drop-shadow-xl"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Floor Base (Simple Rhombus) */}
                {/* Top: centerX, topY */}
                {/* Right: centerX + (gridSize * tileWidth), topY + (gridSize * tileHeight) */}
                {/* Bottom: centerX, topY + 2 * (gridSize * tileHeight) */}
                {/* Left: centerX - (gridSize * tileWidth), topY + (gridSize * tileHeight) */}

                <path
                    d={`
            M ${centerX} ${topY}
            L ${centerX + (gridSize * tileWidth)} ${topY + (gridSize * tileHeight)}
            L ${centerX} ${topY + 2 * (gridSize * tileHeight)}
            L ${centerX - (gridSize * tileWidth)} ${topY + (gridSize * tileHeight)}
            Z
          `}
                    fill="#f8fafc" // Slate-50 instead of blue/gray
                    stroke="#e2e8f0" // Slate-200
                    strokeWidth="3"
                />

                {/* Grid Lines (Optional for tech feel) */}
                <g stroke="#f1f5f9" strokeWidth="1">
                    {Array.from({ length: gridSize + 1 }).map((_, i) => (
                        <path
                            key={`v-${i}`}
                            d={`
                 M ${centerX + (i * tileWidth) - (gridSize * tileWidth)} ${topY + (gridSize * tileHeight) - (i * tileHeight) + (i * tileHeight)} 
                 L ${centerX + (i * tileWidth)} ${topY + (i * tileHeight)}
               `}
                            // This logic is getting complex, let's stick to simple placement first
                            opacity="0.5"
                        />
                    ))}
                </g>

                {/* Fixtures */}
                {/* Render order matters for depth: sort by (x + y) */}
                {fixtures
                    .sort((a, b) => (a.x + a.y) - (b.x + b.y))
                    .map((fixture) => (
                        <FixtureItem
                            key={fixture.id}
                            {...fixture}
                            centerX={centerX}
                            topY={topY}
                            tileWidth={tileWidth}
                            tileHeight={tileHeight}
                        />
                    ))}
            </svg>
        </div>
    );
}

function FixtureItem({ type, status, x, y, centerX, topY, tileWidth, tileHeight }: Fixture & { centerX: number, topY: number, tileWidth: number, tileHeight: number }) {
    // Isometric projection
    // x axis goes down-right
    // y axis goes down-left

    const screenX = centerX + (x - y) * tileWidth;
    const screenY = topY + (x + y) * tileHeight;

    const color = status === 'vacant'
        ? '#10b981' // Emerald-500
        : (status === 'occupied' ? '#ef4444' : '#f59e0b'); // Red-500, Amber-500

    const bg = status === 'vacant' ? '#ecfdf5' : (status === 'occupied' ? '#fef2f2' : '#fffbeb');
    const stroke = status === 'vacant' ? '#34d399' : (status === 'occupied' ? '#f87171' : '#fbbf24');

    // Simple Icon Logic
    if (type === 'toilet') {
        return (
            <g transform={`translate(${screenX}, ${screenY})`}>
                {/* Base Tile Highlight */}
                <path d={`M0 ${-tileHeight} L${tileWidth} 0 L0 ${tileHeight} L${-tileWidth} 0 Z`} fill={bg} opacity="0.8" />

                {/* Toilet Icon (Simple stylized) */}
                <g transform="translate(0, -40)">
                    {/* Bowl */}
                    <path d="M-15 0 C-15 15, 15 15, 15 0 L15 -10 L-15 -10 Z" fill="white" stroke={stroke} strokeWidth="2" />
                    {/* Tank */}
                    <rect x="-15" y="-35" width="30" height="25" rx="3" fill="white" stroke={stroke} strokeWidth="2" />
                    {/* Status Dot */}
                    <circle cx="0" cy="-55" r="6" fill={color} filter="url(#glow)" />
                </g>
            </g>
        )
    }

    if (type === 'urinal') {
        return (
            <g transform={`translate(${screenX}, ${screenY})`}>
                <path d={`M0 ${-tileHeight} L${tileWidth} 0 L0 ${tileHeight} L${-tileWidth} 0 Z`} fill={bg} opacity="0.6" />
                <g transform="translate(0, -30)">
                    <path d="M-10 -10 L-10 10 C-10 20, 10 20, 10 10 L10 -10 Z" fill="white" stroke={stroke} strokeWidth="2" />
                    <rect x="-10" y="-30" width="20" height="20" rx="2" fill="white" stroke={stroke} strokeWidth="2" />
                    <circle cx="0" cy="-45" r="4" fill={color} filter="url(#glow)" />
                </g>
            </g>
        )
    }

    if (type === 'sink') {
        return (
            <g transform={`translate(${screenX}, ${screenY})`}>
                <path d={`M0 ${-tileHeight} L${tileWidth} 0 L0 ${tileHeight} L${-tileWidth} 0 Z`} fill="#f1f5f9" opacity="0.5" />
                <g transform="translate(0, -20)">
                    <rect x="-18" y="-10" width="36" height="10" rx="4" fill="white" stroke="#94a3b8" strokeWidth="2" />
                    <rect x="-2" y="-20" width="4" height="10" fill="#94a3b8" />
                </g>
            </g>
        )
    }

    return null;
}
