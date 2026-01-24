"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);

interface ActivityMapProps {
    location: string;
    lat?: number;
    lng?: number;
    className?: string;
}

export function ActivityMap({ location, lat, lng, className = "" }: ActivityMapProps) {
    const [isClient, setIsClient] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
        lat && lng ? { lat, lng } : null
    );
    const [loading, setLoading] = useState(!coordinates);

    useEffect(() => {
        setIsClient(true);

        // Inject Leaflet CSS via link tag (works better with Next.js SSR)
        const linkId = "leaflet-css";
        if (!document.getElementById(linkId)) {
            const link = document.createElement("link");
            link.id = linkId;
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
            link.crossOrigin = "";
            document.head.appendChild(link);
        }

        // If no coordinates provided, try to geocode the location
        if (!coordinates && location) {
            // Use Nominatim (OpenStreetMap) for free geocoding
            fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
                {
                    headers: {
                        "User-Agent": "TripVega/1.0",
                    },
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.length > 0) {
                        setCoordinates({
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon),
                        });
                    }
                })
                .catch((err) => {
                    console.error("Geocoding error:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [location, coordinates]);

    // Fix for default marker icon in Leaflet with Next.js
    useEffect(() => {
        if (isClient) {
            import("leaflet").then((L) => {
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                });
            });
        }
    }, [isClient]);

    if (!isClient) {
        return (
            <div className={`bg-surface-elevated rounded-2xl flex items-center justify-center ${className}`}>
                <div className="text-center text-muted-foreground p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="font-bold">Loading Map...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`bg-surface-elevated rounded-2xl flex items-center justify-center ${className}`}>
                <div className="text-center text-muted-foreground p-8">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-bold">Finding location...</p>
                </div>
            </div>
        );
    }

    if (!coordinates) {
        return (
            <div className={`bg-surface-elevated rounded-2xl flex items-center justify-center ${className}`}>
                <div className="text-center text-muted-foreground p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-bold text-foreground mb-2">{location}</p>
                    <p className="text-sm">Map coordinates unavailable</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl overflow-hidden border border-theme ${className}`}>
            <MapContainer
                center={[coordinates.lat, coordinates.lng]}
                zoom={4} // Zoomed out to show continent
                style={{ height: "100%", width: "100%", minHeight: "100%", background: "#020617" }} // Dark background matching theme
                scrollWheelZoom={false}
                zoomControl={false} // Clean look
                dragging={false} // Static background feel
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[coordinates.lat, coordinates.lng]}>
                    <Popup>
                        <div className="font-bold text-foreground">{location}</div>
                        <div className="text-sm text-muted-foreground">Meeting Point</div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
