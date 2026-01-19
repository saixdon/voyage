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

    // Tour Mode State
    const [isTouring, setIsTouring] = useState(false);
    const [tourIndex, setTourIndex] = useState(0);
    const [tourPaused, setTourPaused] = useState(false);

    // Navigation Animation State
    const [navigatingTo, setNavigatingTo] = useState<{ name: string; query: string } | null>(null);

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

    // Tour Logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTouring && !tourPaused && trendingDestinations.length > 0) {
            // Update view to current destination
            const dest = trendingDestinations[tourIndex];
            if (globeRef.current && dest) {
                globeRef.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 2.0 }, 2000);

                // After rotation, zoom in slightly
                setTimeout(() => {
                    if (isTouring && !tourPaused) {
                        globeRef.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 1.5 }, 1500);
                    }
                }, 2000);
            }

            // Move to next destination after 10 seconds
            timer = setTimeout(() => {
                setTourIndex((prev) => (prev + 1) % trendingDestinations.length);
            }, 10000);
        }
        return () => clearTimeout(timer);
    }, [isTouring, tourIndex, tourPaused, trendingDestinations]);


    const handleContinentClick = (polygon: any) => {
        // Stop tour if user interacts
        setIsTouring(false);

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
    };

    // Simple navigation (without animation)
    const navigateToSearch = (query: string) => {
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    // Animated navigation with globe fly-to effect
    const navigateWithAnimation = (name: string, query: string) => {
        // Find coordinates for this destination
        const dest = trendingDestinations.find(d =>
            d.name.toLowerCase() === name.toLowerCase() ||
            d.country.toLowerCase() === name.toLowerCase()
        );

        if (dest && globeRef.current) {
            // Stop any tour
            setIsTouring(false);
            // Close continent modal
            setSelectedContinent(null);
            // Set loading state
            setNavigatingTo({ name, query });

            // Animate globe to destination
            globeRef.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 2.0 }, 1500);

            // Zoom in after initial rotation
            setTimeout(() => {
                if (globeRef.current) {
                    globeRef.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 1.2 }, 1000);
                }
            }, 1500);

            // Navigate after animation completes
            setTimeout(() => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                setNavigatingTo(null);
            }, 3000);
        } else {
            // No coordinates found, navigate directly
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const toggleTour = () => {
        if (!isTouring) {
            setIsTouring(true);
            setTourPaused(false);
            setTourIndex(0);
        } else {
            setTourPaused(!tourPaused);
        }
    };

    const nextTourStop = () => {
        setTourIndex((prev) => (prev + 1) % trendingDestinations.length);
    };

    const prevTourStop = () => {
        setTourIndex((prev) => (prev - 1 + trendingDestinations.length) % trendingDestinations.length);
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
                    // Use "Earth Night" texture for more color (city lights) instead of dark void
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                    polygonsData={continents}
                    // Lift hovered continent slightly
                    polygonAltitude={(d: any) => d === hoveredContinent || d === selectedContinent ? 0.06 : 0.01}

                    // Colors:
                    // default: Slight visible tint for continents (so it's not just black)
                    // hover/select: Bright Blue
                    polygonCapColor={(d: any) => {
                        if (d === hoveredContinent || d === selectedContinent) {
                            return "rgba(43, 140, 238, 0.2)"; // Visible on hover but still see-through
                        }
                        return "rgba(0, 0, 0, 0)"; // Fully transparent - show earth texture
                    }}
                    polygonSideColor={(d: any) => {
                        if (d === hoveredContinent || d === selectedContinent) {
                            return "rgba(43, 140, 238, 0.6)";
                        }
                        return "rgba(0, 0, 0, 0)"; // Fully transparent
                    }}
                    polygonStrokeColor={(d: any) => {
                        if (d === hoveredContinent || d === selectedContinent) {
                            return "#2b8cee";
                        }
                        return "rgba(255, 255, 255, 0)"; // Removed visible lines
                    }}
                    polygonLabel={({ properties: d }: any) => `
                        <div class="px-4 py-3 bg-black/90 backdrop-blur-md border border-primary/40 rounded-xl text-white font-bold shadow-2xl">
                            <p class="text-xs uppercase tracking-widest text-primary mb-1">Continent</p>
                            <p class="text-2xl">${d.name}</p>
                        </div>
                    `}
                    onPolygonHover={(polygon: any) => setHoveredContinent(polygon)}
                    onPolygonClick={handleContinentClick}
                    onGlobeClick={() => setIsTouring(false)}

                    atmosphereColor="#3a228a"
                    atmosphereAltitude={0.25}

                    // Pin markers for trending destinations
                    htmlElementsData={trendingDestinations}
                    htmlLat={(d: any) => d.lat}
                    htmlLng={(d: any) => d.lng}
                    htmlAltitude={0.02}
                    htmlTransitionDuration={2000}
                    htmlElement={(d: any) => {
                        const isActive = isTouring && trendingDestinations[tourIndex]?.id === d.id;

                        const el = document.createElement('div');
                        el.style.pointerEvents = 'auto';
                        el.style.cursor = 'pointer';
                        el.style.zIndex = isActive ? '2000' : '1000';
                        el.className = 'group';

                        // "Stecknadel" (Pin) Design - Simplified for better visibility
                        el.innerHTML = `
                            <div class="pin-container" style="position: relative; width: 60px; height: 80px; transform: translate(-50%, -100%); cursor: pointer;">
                                
                                <!-- Pin Head (Glowing Sphere) -->
                                <div style="position: absolute; left: 50%; top: 0; transform: translateX(-50%); width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); box-shadow: 0 0 20px rgba(79,172,254,0.8), 0 0 40px rgba(79,172,254,0.4); border: 3px solid white; z-index: 20;">
                                    <div style="position: absolute; top: 4px; left: 4px; width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5);"></div>
                                </div>
                                
                                <!-- Pin Stick -->
                                <div style="position: absolute; left: 50%; top: 22px; transform: translateX(-50%); width: 3px; height: 30px; background: linear-gradient(to bottom, white, transparent); z-index: 10;"></div>
                                
                                <!-- Pulse Effect for Active -->
                                ${isActive ? `<div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(43,140,238,0.5); animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}

                                <!-- City Label (Always visible) -->
                                <div style="position: absolute; top: 56px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); z-index: 25;">
                                    <span style="color: white; font-size: 12px; font-weight: 600;">${d.name}</span>
                                </div>
                            </div>

                            <!-- Tooltip Card (Shows on hover/active) -->
                            <div class="pin-tooltip" style="position: absolute; bottom: 90px; left: 50%; transform: translateX(-50%); width: 280px; background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.8); z-index: 100; opacity: ${isActive ? '1' : '0'}; pointer-events: ${isActive ? 'auto' : 'none'}; transition: opacity 0.3s ease;">
                                
                                <!-- Image Area -->
                                <div style="position: relative; height: 140px; overflow: hidden;">
                                    <img src="${d.image}" style="width: 100%; height: 100%; object-fit: cover; ${isActive ? 'animation: ken-burns 10s ease-in-out infinite;' : ''}" onerror="this.src='https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'" />
                                    <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);"></div>
                                    
                                    <div style="position: absolute; bottom: 12px; left: 16px; right: 16px;">
                                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #4facfe; animation: pulse 2s infinite;"></span>
                                            <span style="color: #4facfe; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Live View</span>
                                        </div>
                                        <h3 style="color: white; font-size: 20px; font-weight: 700; margin: 0;">${d.name}</h3>
                                    </div>
                                </div>

                                <!-- Content -->
                                <div style="padding: 16px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <span style="color: #9ca3af; font-size: 14px;">${d.country}</span>
                                        <span style="color: #fbbf24; font-size: 14px;">★ 4.9</span>
                                    </div>
                                    <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
                                        <div style="height: 100%; background: #4facfe; ${isActive ? 'animation: progress-bar 10s linear infinite;' : 'width: 0;'}"></div>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="color: #6b7280; font-size: 12px;">Trending Now</span>
                                        <span style="color: #4facfe; font-weight: 700; font-size: 13px;">View Details →</span>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Add hover effect for non-active pins
                        if (!isActive) {
                            el.addEventListener('mouseenter', () => {
                                const tooltip = el.querySelector('.pin-tooltip') as HTMLElement;
                                if (tooltip) {
                                    tooltip.style.opacity = '1';
                                    tooltip.style.pointerEvents = 'auto';
                                }
                            });
                            el.addEventListener('mouseleave', () => {
                                const tooltip = el.querySelector('.pin-tooltip') as HTMLElement;
                                if (tooltip) {
                                    tooltip.style.opacity = '0';
                                    tooltip.style.pointerEvents = 'none';
                                }
                            });
                        }

                        el.addEventListener('click', (e) => {
                            // If touching the card inside, we want navigation
                            e.preventDefault();
                            e.stopPropagation();
                            navigateToSearch(d.name);
                        });

                        return el;
                    }}
                />
            )}

            {/* UI Overlay */}
            <div className={`absolute top-10 left-10 z-10 pointer-events-none transition-opacity duration-1000 ${isTouring ? 'opacity-0' : 'opacity-100'}`}>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter animate-fade-in-up">
                    EXPLORE THE <span className="text-primary">WORLD</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-md animate-fade-in-up-delay-1 font-light">
                    Select a continent or start a virtual tour to discover breathtaking destinations.
                </p>

                {/* Tour Controls - MOVED OUTSIDE this div because they need to be clickable and visible during tour */}
            </div>

            {/* Tour Controls (Always visible when controls are needed, but we probably want "Start Tour" inside the main header when NOT touring, and "Stop" somewhere else?)
                Actually, the user wants controls. Let's keep a dedicated controls area.
             */}
            <div className="absolute top-[300px] left-10 z-20 flex items-center gap-4">
                {/* Only show "Start" when title is visible? No, let's make a persistent control bar or toggle. */}
                {/* Re-implementing the controls to be independent of the fading title */}
                <button
                    onClick={toggleTour}
                    className={`px-8 py-4 rounded-xl font-bold text-white flex items-center gap-3 transition-all ${isTouring && !tourPaused ? 'bg-red-500/80 hover:bg-red-600' : 'bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(43,140,238,0.4)]'}`}
                >
                    <span className="material-symbols-outlined">{isTouring && !tourPaused ? 'pause' : 'play_arrow'}</span>
                    {isTouring && !tourPaused ? 'Pause Tour' : 'Start World Tour'}
                </button>

                {isTouring && (
                    <div className="flex bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/10">
                        <button onClick={prevTourStop} className="p-3 hover:bg-white/10 rounded-lg text-white transition-colors">
                            <span className="material-symbols-outlined">skip_previous</span>
                        </button>
                        <button onClick={() => { setIsTouring(false); }} className="p-3 hover:bg-white/10 rounded-lg text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <button onClick={nextTourStop} className="p-3 hover:bg-white/10 rounded-lg text-white transition-colors">
                            <span className="material-symbols-outlined">skip_next</span>
                        </button>
                    </div>
                )}
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
                                            onClick={() => navigateWithAnimation(country, country)}
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

            {/* Navigation Loading Overlay */}
            {navigatingTo && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none">
                    <div className="flex flex-col items-center gap-6 animate-fade-in-up">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-3xl">flight_takeoff</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 text-sm mb-2">Flying to</p>
                            <h2 className="text-white text-3xl font-bold">{navigatingTo.name}</h2>
                        </div>
                        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-progress-bar"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}
