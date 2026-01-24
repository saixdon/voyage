"use client";

import React from "react";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { ActivityCard } from "@/components/features/ActivityCard";
import { Link } from "@/lib/i18n/navigation";

export default function DashboardFavoritesPage() {
    const { favorites, isLoading } = useFavorites();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-dark pt-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8">
                        Gespeicherte Aktivitäten
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[4/5] rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // State for separate filters
    const [searchTerm, setSearchTerm] = React.useState("");
    const [activeCity, setActiveCity] = React.useState("all");
    const [activeCountry, setActiveCountry] = React.useState("all");
    const [activeCategory, setActiveCategory] = React.useState("all");
    const [activeCollection, setActiveCollection] = React.useState("all");

    // Collections State
    const [collections, setCollections] = React.useState<{ id: string, name: string }[]>([]);
    const [isCreatingCollection, setIsCreatingCollection] = React.useState(false);
    const [newCollectionName, setNewCollectionName] = React.useState("");

    // Load Collections
    React.useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await fetch("/api/collections");
                if (res.ok) {
                    const data = await res.json();
                    setCollections(data);
                }
            } catch (e) {
                console.error("Failed to load collections", e);
            }
        };
        fetchCollections();
    }, []);

    // Create Collection
    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;
        try {
            const res = await fetch("/api/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCollectionName })
            });
            if (res.ok) {
                const newCol = await res.json();
                setCollections(prev => [newCol, ...prev]);
                setNewCollectionName("");
                setIsCreatingCollection(false);
                setActiveCollection(newCol.id); // Auto-select new collection
            }
        } catch (e) {
            console.error("Failed to create collection", e);
        }
    };

    // 1. Extract Locations (City & Country)
    const { cities, countries } = React.useMemo(() => {
        const citySet = new Set<string>();
        const countrySet = new Set<string>();

        favorites.forEach(f => {
            if (!f.activity_location) return;
            const parts = f.activity_location.split(',').map(s => s.trim());

            // Assumption: Format is "City, Country" or just "City"
            if (parts.length > 0) citySet.add(parts[0]);
            if (parts.length > 1) countrySet.add(parts[parts.length - 1]); // Last part usually Country
        });

        return {
            cities: Array.from(citySet).sort(),
            countries: Array.from(countrySet).sort()
        };
    }, [favorites]);

    // 2. Define Categories
    const CATEGORIES = [
        { id: "food", label: "Essen & Trinken", keywords: ["food", "wine", "dinner", "lunch", "tasting", "cooking", "meal", "kulinarisch"] },
        { id: "culture", label: "Kunst & Kultur", keywords: ["museum", "art", "history", "culture", "tour", "guide", "ticket", "entry"] },
        { id: "adventure", label: "Abenteuer & Sport", keywords: ["hiking", "sport", "climbing", "kayak", "swim", "adventure", "safari"] },
        { id: "water", label: "Wasser", keywords: ["boat", "cruise", "yacht", "sail", "water"] },
    ];

    // 3. Define Custom Collections (Simulation)
    // const [collections, setCollections] = React.useState([
    //     { id: "summer24", label: "Sommer 2025" },
    //     { id: "bucketlist", label: "Bucket List" }
    // ]);

    // 4. Master Filter Logic
    const filteredFavorites = React.useMemo(() => {
        return favorites.filter(fav => {
            // Text Search (Robust)
            const searchLower = searchTerm.toLowerCase();
            const titleMatch = (fav.activity_title?.toLowerCase() || "").includes(searchLower);
            const locMatch = (fav.activity_location?.toLowerCase() || "").includes(searchLower);

            if (searchTerm && !titleMatch && !locMatch) return false;

            // City Filter
            if (activeCity !== "all") {
                if (!fav.activity_location?.toLowerCase().includes(activeCity.toLowerCase())) return false;
            }

            // Country Filter
            if (activeCountry !== "all") {
                const parts = (fav.activity_location || "").split(',').map(s => s.trim());
                const country = parts.length > 1 ? parts[parts.length - 1] : "";
                if (country.toLowerCase() !== activeCountry.toLowerCase()) return false;
            }

            // Category Filter
            if (activeCategory !== "all") {
                const cat = CATEGORIES.find(c => c.id === activeCategory);
                if (cat) {
                    const text = (fav.activity_title + " " + (fav.activity_duration || "")).toLowerCase();
                    const hasKeyword = cat.keywords.some(k => text.includes(k));
                    if (!hasKeyword) return false;
                }
            }

            // Collection Filter (Real Implementation pending DB relation)
            // For now, if we had a collection_id on fav, we would check it.
            // Since we just added the table, existing favorites don't have it.
            // We'll skip exact filtering for now unless we implement the drag-drop assign.
            // But to satisfy "New" working, we at least allow creating it.

            return true;
        });
    }, [favorites, searchTerm, activeCity, activeCountry, activeCategory, activeCollection]);

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("");
        setActiveCity("all");
        setActiveCountry("all");
        setActiveCategory("all");
        setActiveCollection("all");
    };

    const hasActiveFilters = searchTerm || activeCity !== "all" || activeCountry !== "all" || activeCategory !== "all" || activeCollection !== "all";

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground">
                            Gespeicherte Erlebnisse
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {favorites.length} Aktivitäten in deiner Sammlung
                        </p>
                    </div>
                </div>

                {/* Main Filter Bar */}
                <div className="flex flex-col gap-6 mb-10">

                    {/* Top Row: Search & Country Dropdown */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Titel, Stadt oder Land..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-surface border border-theme rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                            />
                        </div>

                        {/* Country Dropdown */}
                        {countries.length > 0 && (
                            <div className="relative">
                                <select
                                    value={activeCountry}
                                    onChange={(e) => { setActiveCountry(e.target.value); setActiveCity("all"); }}
                                    className="h-12 pl-4 pr-10 bg-surface border border-theme rounded-xl text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary min-w-[180px] shadow-sm"
                                >
                                    <option value="all">Alle Länder ({countries.length})</option>
                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                        )}

                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="h-12 px-6 text-red-500 font-medium hover:bg-red-500/10 rounded-xl transition-colors ml-auto"
                            >
                                Filter löschen
                            </button>
                        )}
                    </div>

                    {/* Middle Row: Cities (Horizontal List) */}
                    {cities.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                <span className="text-sm font-medium text-muted-foreground mr-2 whitespace-nowrap">Städte:</span>
                                <button
                                    onClick={() => setActiveCity("all")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCity === "all"
                                        ? "bg-foreground text-background"
                                        : "bg-surface border border-theme text-muted-foreground hover:border-foreground"
                                        }`}
                                >
                                    Alle
                                </button>
                                {cities.filter(city => activeCountry === "all" || favorites.some(f => f.activity_location?.includes(city) && f.activity_location?.includes(activeCountry)))
                                    .map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setActiveCity(c)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCity === c
                                                ? "bg-foreground text-background"
                                                : "bg-surface border border-theme text-muted-foreground hover:border-foreground"
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Row: Categories & Collections */}
                    <div className="flex flex-col md:flex-row gap-6 pt-6 border-t border-theme-light">
                        {/* Categories */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mr-2">Kategorie:</span>
                            <button
                                onClick={() => setActiveCategory("all")}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeCategory === "all"
                                    ? "bg-primary/20 text-primary border border-primary/20"
                                    : "bg-surface text-muted-foreground border border-transparent hover:text-foreground"
                                    }`}
                            >
                                Alle
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeCategory === cat.id
                                        ? "bg-primary/20 text-primary border border-primary/20"
                                        : "bg-surface text-muted-foreground border border-transparent hover:text-primary"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Collections */}
                        <div className="flex flex-wrap items-center gap-2 md:border-l md:border-theme-light md:pl-6">
                            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mr-2">Meine Listen:</span>
                            <button
                                onClick={() => setActiveCollection("all")}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeCollection === "all"
                                    ? "bg-foreground text-background"
                                    : "bg-surface text-muted-foreground border border-transparent hover:text-foreground"
                                    }`}
                            >
                                Alle
                            </button>
                            {collections.map(col => (
                                <button
                                    key={col.id}
                                    onClick={() => setActiveCollection(col.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeCollection === col.id
                                        ? "bg-purple-500 text-white"
                                        : "bg-surface text-muted-foreground border border-transparent hover:text-purple-500"
                                        }`}
                                >
                                    {col.name}
                                </button>
                            ))}

                            {isCreatingCollection ? (
                                <div className="flex items-center gap-2 bg-surface border border-theme rounded-full px-2 py-1">
                                    <input
                                        autoFocus
                                        className="bg-transparent text-xs w-24 focus:outline-none"
                                        placeholder="Name..."
                                        value={newCollectionName}
                                        onChange={(e) => setNewCollectionName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                                    />
                                    <button onClick={handleCreateCollection} className="text-green-500 hover:text-green-600 material-symbols-outlined text-[16px]">check</button>
                                    <button onClick={() => setIsCreatingCollection(false)} className="text-red-400 hover:text-red-500 material-symbols-outlined text-[16px]">close</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsCreatingCollection(true)}
                                    className="px-3 py-1 rounded-full text-xs font-bold border border-dashed border-theme text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[14px]">add</span>
                                    <span>Neu</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>


                {filteredFavorites.length === 0 ? (
                    <div className="text-center py-20 bg-surface border border-theme rounded-3xl">
                        <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
                            {searchTerm || activeCategory !== "all" || activeCity !== "all" || activeCountry !== "all" || activeCollection !== "all" ? "filter_list_off" : "favorite_border"}
                        </span>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            {searchTerm || activeCategory !== "all" || activeCity !== "all" || activeCountry !== "all" || activeCollection !== "all"
                                ? "Keine Ergebnisse für diese Filter"
                                : "Noch keine Favoriten"}
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto px-6">
                            {searchTerm || activeCategory !== "all" || activeCity !== "all" || activeCountry !== "all" || activeCollection !== "all"
                                ? "Versuchen Sie, Ihre Suchbegriffe oder Filter anzupassen."
                                : "Speichern Sie Aktivitäten, die Ihnen gefallen, um sie hier wiederzufinden."}
                        </p>
                        <div className="flex justify-center gap-4">
                            {(searchTerm || activeCategory !== "all" || activeCity !== "all" || activeCountry !== "all" || activeCollection !== "all") && (
                                <button
                                    onClick={resetFilters}
                                    className="px-6 py-2 border border-theme rounded-xl hover:bg-surface-elevated transition-colors"
                                >
                                    Filter zurücksetzen
                                </button>
                            )}
                            <Link
                                href="/search?q=popular"
                                className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
                            >
                                Erlebnisse entdecken
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {filteredFavorites.map((fav) => (
                            <ActivityCard
                                key={fav.activity_id}
                                id={fav.activity_id}
                                title={fav.activity_title}
                                location={fav.activity_location || ""}
                                image={fav.activity_image || ""}
                                price={fav.activity_price || 0}
                                currency={fav.activity_currency || "€"}
                                rating={fav.activity_rating || 0}
                                reviewCount={fav.activity_review_count || 0}
                                duration={fav.activity_duration || ""}
                                isSaved={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
