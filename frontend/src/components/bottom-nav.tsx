"use-client";

import { Home, Clock, Heart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
    // Mock pathname for now since this is server component or client
    // In real app use usePathname
    const pathname = "/";

    const navItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: Clock, label: "History", href: "/history" },
        { icon: Heart, label: "Favorites", href: "/favorites" },
        { icon: User, label: "Profile", href: "/profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-md bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center pointer-events-auto rounded-t-3xl shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex flex-col items-center gap-1"
                        >
                            <div
                                className={cn(
                                    "p-2 rounded-xl transition-colors",
                                    isActive ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            {isActive && (
                                <div className="w-1 h-1 bg-red-500 rounded-full mt-1" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
