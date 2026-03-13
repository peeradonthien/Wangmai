"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PlaceCardProps {
    id: string;
    name: string;
    location: string;
    image: string;
    occupancyRating: number; // e.g., 80.2
    isFavorite?: boolean;
    className?: string;
}

export function PlaceCard({
    id,
    name,
    location,
    image,
    occupancyRating,
    isFavorite,
    className,
}: PlaceCardProps) {
    const isCrowded = occupancyRating > 80;
    const isModerate = occupancyRating > 50 && occupancyRating <= 80;

    return (
        <Link href={`/restroom/${id}`}>
            <Card
                className={cn(
                    "group relative overflow-hidden border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 rounded-2xl",
                    className
                )}
            >
                <CardContent className="p-0">
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                        <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 z-10">
                            <button className="p-2 rounded-full bg-white/90 shadow-sm text-slate-400 hover:text-red-500 transition-colors">
                                <Heart
                                    size={16}
                                    className={cn(isFavorite ? "fill-red-500 text-red-500" : "")}
                                />
                            </button>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1">
                            <MapPin size={12} className="text-slate-500" />
                            {location}
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{name}</h3>
                                <p className="text-xs text-slate-500">Open 24 Hours</p>
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
                                isCrowded ? "bg-red-50 text-red-600 border border-red-100" :
                                    isModerate ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                        "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full",
                                    isCrowded ? "bg-red-500" :
                                        isModerate ? "bg-amber-500" :
                                            "bg-emerald-500"
                                )} />
                                {occupancyRating > 50 ? "Low Availability" : "Available"}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                <span className="font-medium text-slate-700">4.5</span>
                                <span className="text-slate-400">(120)</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-xs">
                                <span>Risk:</span>
                                <span className={cn("font-bold", occupancyRating > 50 ? "text-red-600" : "text-emerald-600")}>
                                    {occupancyRating}%
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
