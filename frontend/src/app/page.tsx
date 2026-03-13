"use client";

import { BottomNav } from "@/components/bottom-nav";
import { PlaceCard } from "@/components/place-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock Data
const PLACES = [
  {
    id: "1",
    name: "วิศวกรรมศาสตร์ ตึก 3",
    location: "Chulalongkorn University",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop",
    occupancyRating: 80.2,
    isFavorite: true,
  },
  {
    id: "2",
    name: "สยามสแควร์วัน",
    location: "Siam Square One",
    image: "https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=600&auto=format&fit=crop",
    occupancyRating: 45.0,
    isFavorite: false,
  },
];

const CATEGORIES = ["Most Viewed", "Nearby", "Latest"];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Most Viewed");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Web App Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">
              RM
            </div>
            <span className="font-bold text-lg">Restroom Monitor</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex text-sm text-slate-500 gap-1">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold">Live</span>
              <span>System Operational</span>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {/* Hero / Search Section */}
        <section className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Find Available Restrooms
          </h1>
          <p className="text-slate-500 mb-8 max-w-2xl">
            Real-time occupancy tracking for campus and public facilities.
            Check status before you go.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search building, floor, or zone..."
                className="pl-10 pr-4 h-12 bg-white border-slate-200 shadow-sm focus-visible:ring-2 focus-visible:ring-slate-900 rounded-xl"
              />
            </div>
            <button className="flex items-center justify-center px-6 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm gap-2">
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </button>
          </div>
        </section>

        {/* Categories Tab */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeCategory === category
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                {category}
              </button>
            ))}
          </div>
          <Link href="#" className="text-sm font-semibold text-slate-900 hover:text-slate-700 hidden sm:block">
            View All Locations &rarr;
          </Link>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PLACES.map((place) => (
            <PlaceCard
              key={place.id}
              id={place.id}
              name={place.name}
              location={place.location}
              image={place.image}
              occupancyRating={place.occupancyRating}
              isFavorite={place.isFavorite}
              className="hover:translate-y-[-4px] transition-transform duration-300"
            />
          ))}
        </div>
      </main>

      {/* Mobile Bottom Nav (Visible only on small screens) */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
