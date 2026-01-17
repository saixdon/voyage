"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import Globe to avoid SSR issues with Three.js
const Globe = dynamic(() => import("react-globe.gl"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/50 animate-pulse">Initializing World Map...</p>
            </div>
        </div>
    ),
});

interface Continent {
    id: string;
    name: string;
    countries: string[];
}

interface CountryInfo {
    country: string;
    continent: string;
}

export default function GlobeDestinations() {
    const router = useRouter();
    const globeRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [continents, setContinents] = useState<any[]>([]);
    const [allCountries, setAllCountries] = useState<CountryInfo[]>([]);
    const [hoveredContinent, setHoveredContinent] = useState<string | null>(null);
    const [selectedContinent, setSelectedContinent] = useState<any | null>(null);
    const [continentCountries, setContinentCountries] = useState<string[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [trendingDestinations, setTrendingDestinations] = useState<any[]>([]);

    useEffect(() => {
        // Fetch continent polygons
        fetch("https://raw.githubusercontent.com/highcharts/map-collection-dist/master/custom/world-continents.geo.json")
            .then(res => res.json())
            .then(data => {
                setContinents(data.features);
            });

        // Fetch country-to-continent mapping
        fetch("https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-continent.json")
            .then(res => res.json())
            .then(data => {
                setAllCountries(data);
            });

        // Fetch trending destinations
        fetch("/api/viator/destinations/trending")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.destinations) {
                    setTrendingDestinations(data.destinations.filter((d: any) => d.lat && d.lng));
                }
            });

        // Resize Observer to fix "right spacing" issue
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions(); // Initial call

        // Small delay to ensure container is rendered and sized
        const timeout = setTimeout(updateDimensions, 100);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            clearTimeout(timeout);
        };
    }, []);

    const handleContinentClick = (polygon: any) => {
        const name = polygon.properties.name;
        setSelectedContinent(polygon);

        // Filter countries for the selected continent
        const trendingCountries = new Set(trendingDestinations.map(d => d.country));

        const filtered = allCountries
            .filter(c => c.continent === name)
            .map(c => c.country)
            .sort((a, b) => {
                const aTrending = trendingCountries.has(a);
                const bTrending = trendingCountries.has(b);
                if (aTrending && !bTrending) return -1;
                if (!aTrending && bTrending) return 1;
                return a.localeCompare(b);
            });
        setContinentCountries(filtered);

        // Auto-rotate globe to the clicked continent
        if (globeRef.current && polygon.properties.hc_key) {
            // Optional: recenter globe
        }
    };

    const navigateToSearch = (query: string) => {
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div ref={containerRef} className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-[#050505]">
            {/* Globe Background Gradient */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#000814] to-black"></div>

            {(dimensions.width > 0 && dimensions.height > 0) && (
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    // Use dark earth texture
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                    polygonsData={continents}
                    // Lift hovered continent slightly
                    polygonAltitude={(d: any) => d === hoveredContinent || d === selectedContinent ? 0.04 : 0.005}

                    // Colors: Transparent by default, subtle blue on hover
                    polygonCapColor={(d: any) => {
                        if (d === hoveredContinent || d === selectedContinent) {
                            return "rgba(43, 140, 238, 0.25)"; // Less opaque
                        }
                        return "rgba(255, 255, 255, 0)"; // Transparent otherwise
                    }}
                    polygonSideColor={(d: any) => {
                        if (d === hoveredContinent || d === selectedContinent) {
                            return "rgba(43, 140, 238, 0.6)";
                        }
                        return "rgba(0,0,0,0)";
                    }}
                    polygonStrokeColor={(d: any) => {
                        if (d === hoveredContinent || d === selectedContinent) {
                            return "#2b8cee";
                        }
                        return "rgba(255,255,255,0.1)";
                    }}
                    polygonLabel={({ properties: d }: any) => `
                        <div class="px-4 py-3 bg-black/90 backdrop-blur-md border border-primary/40 rounded-xl text-white font-bold shadow-2xl">
                            <p class="text-xs uppercase tracking-widest text-primary mb-1">Continent</p>
                            <p class="text-2xl">${d.name}</p>
                        </div>
                    `}
                    onPolygonHover={(polygon: any) => setHoveredContinent(polygon)}
                    onPolygonClick={handleContinentClick}

                    atmosphereColor="#2b8cee"
                    atmosphereAltitude={0.15}

                    // Pin markers for trending destinations
                    htmlElementsData={trendingDestinations}
                    htmlLat={(d: any) => d.lat}
                    htmlLng={(d: any) => d.lng}
                    htmlAltitude={0.1}
                    htmlTransitionDuration={0}
                    htmlElement={(d: any) => {
                        const el = document.createElement('div');
                        el.style.pointerEvents = 'auto';
                        el.style.cursor = 'pointer';
                        el.style.zIndex = '1000';
                        el.className = 'group';

                        el.innerHTML = `
                            <!-- Large Pin Marker -->
                            <div style="transform: translate(-50%, -100%); pointer-events: auto;" class="relative group-hover:scale-125 transition-transform duration-300">
                                <svg width="48" height="64" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 12px rgba(43,140,238,0.6));">
                                    <path d="M16 0C7.163 0 0 7.163 0 16C0 26.5 16 42 16 42C16 42 32 26.5 32 16C32 7.163 24.837 0 16 0ZM16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22Z" fill="#2b8cee"/>
                                    <circle cx="16" cy="16" r="5" fill="white"/>
                                </svg>
                                <!-- Pulse Ring -->
                                <div style="position: absolute; top: 24px; left: 24px; transform: translate(-50%, -50%); width: 40px; height: 40px; background: rgba(43,140,238,0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; z-index: -1;"></div>
                                
                                <!-- City Label -->
                                <div style="position: absolute; top: 70px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: rgba(0,0,0,0.8); padding: 4px 12px; border-radius: 8px; border: 1px solid rgba(43,140,238,0.5);">
                                    <span style="color: white; font-weight: bold; font-size: 12px;">${d.name}</span>
                                </div>
                            </div>
                            
                            <!-- Tooltip on Hover -->
                            <div style="position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(10px); width: 280px; background: rgba(20,20,25,0.98); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; overflow: hidden; opacity: 0; pointer-events: none; transition: all 0.3s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.6); z-index: 100;" class="group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0">
                                <div style="position: relative; height: 140px;">
                                    <img src="${d.highlightActivity?.image || d.image}" style="width: 100%; height: 100%; object-fit: cover;" />
                                    <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);"></div>
                                    <div style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                                        <span style="font-size: 11px; font-weight: bold; color: white;">★ ${d.highlightActivity?.rating || '4.8'}</span>
                                    </div>
                                    <div style="position: absolute; bottom: 10px; left: 14px; right: 14px;">
                                        <span style="font-size: 10px; color: #2b8cee; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Top Experience in ${d.name}</span>
                                        <h4 style="color: white; font-weight: bold; font-size: 14px; line-height: 1.3; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${d.highlightActivity?.name || 'Discover Amazing Tours'}</h4>
                                    </div>
                                </div>
                                <div style="padding: 14px;">
                                    <p style="font-size: 12px; color: #9ca3af; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${d.highlightActivity?.description || 'Explore the best attractions and hidden gems in ' + d.name + '.'}</p>
                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                                        <div>
                                            <p style="font-size: 10px; color: #6b7280;">Starting from</p>
                                            <p style="font-size: 18px; font-weight: bold; color: #2b8cee;">${d.highlightActivity?.price || 'View Price'}</p>
                                        </div>
                                        <div style="background: rgba(43,140,238,0.2); color: white; font-size: 12px; font-weight: bold; padding: 10px 16px; border-radius: 10px; border: 1px solid rgba(43,140,238,0.4);">
                                            Explore →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;

                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigateToSearch(d.name);
                        });

                        return el;
                    }}
                />
            )}

            {/* UI Overlay */}
            <div className="absolute top-10 left-10 z-10 pointer-events-none">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter opacity-0 animate-fade-in-up">
                    EXPLORE THE <span className="text-primary">WORLD</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-md opacity-0 animate-fade-in-up-delay-1 font-light">
                    Select a continent on the interactive globe to discover breathtaking destinations and unique local experiences.
                </p>
            </div>

            {/* Country List / Selection Modal */}
            {selectedContinent && (
                <div className="absolute inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-4 md:p-10 pointer-events-none">
                    <div className="bg-card-dark/95 border border-white/10 p-8 rounded-[2rem] w-full max-w-xl h-full overflow-hidden shadow-2xl animate-slide-in-right pointer-events-auto flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-primary font-medium tracking-widest uppercase text-xs mb-1">Continent</h3>
                                <h2 className="text-5xl font-bold text-white tracking-tight">{selectedContinent.properties.name}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedContinent(null)}
                                className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10"
                            >
                                <span className="material-symbols-outlined text-white">close</span>
                            </button>
                        </div>

                        <div className="relative flex-1 overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-card-dark to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card-dark to-transparent z-10 pointer-events-none"></div>

                            <div className="h-full overflow-y-auto pr-4 custom-scrollbar py-6">
                                <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                                    Browse through {continentCountries.length} countries in {selectedContinent.properties.name} to find your next adventure.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {continentCountries.map((country) => (
                                        <button
                                            key={country}
                                            onClick={() => navigateToSearch(country)}
                                            className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all text-left group"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                                            <span className="text-white font-medium group-hover:text-primary transition-colors">{country}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10">
                            <button
                                onClick={() => navigateToSearch(selectedContinent.properties.name)}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-[0_0_30px_rgba(43,140,238,0.3)]"
                            >
                                <span className="material-symbols-outlined">explore</span>
                                Explore all {selectedContinent.properties.name}
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend / Instructions */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-6 text-white/70 text-sm shadow-2xl">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">drag_pan</span>
                    <span>Rotate</span>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">mouse</span>
                    <span>Zoom</span>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">touch_app</span>
                    <span>Select Continent</span>
                </div>
            </div>
        </div>
    );
}
