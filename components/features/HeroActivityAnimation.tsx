"use client";

import React, { useRef, useEffect, useState } from "react";

export function HeroActivityAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [frames, setFrames] = useState<string[]>([]);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastDimensions = useRef({ width: 0, height: 0 });

    // 1. Fetch the manifest
    useEffect(() => {
        // Use API route to avoid static file serving issues with localization middleware
        fetch('/api/animation-frames')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log("Manifest loaded, frames:", data.length);
                setFrames(data);
                preloadImages(data);
            })
            .catch(err => console.error("Failed to load frames manifest:", err));
    }, []);

    // 2. Preload images (naive strategy for smoothness)
    // We try to keep a buffer. For simplicity in this demo, we verify minimal buffer.
    const preloadImages = (framePaths: string[]) => {
        let loadedCount = 0;
        const total = framePaths.length;
        const loadedImgs: HTMLImageElement[] = new Array(total);

        // Prioritize first 60 frames for immediate start
        framePaths.forEach((src, idx) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loadedImgs[idx] = img;
                loadedCount++;
                if (loadedCount === 50) { // Start playing once we have a buffer
                    setIsLoaded(true);
                }
            };
            // Keep reference to avoid GC
            loadedImgs[idx] = img;
        });
        setImages(loadedImgs);
    };

    // 3. Visibility Tracking
    useEffect(() => {
        if (!canvasRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(canvasRef.current);
        return () => observer.disconnect();
    }, []);

    // 4. Animation Loop
    useEffect(() => {
        if (!isLoaded || images.length === 0 || !canvasRef.current || !isVisible) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false }); // Optimization: no alpha
        if (!ctx) return;

        let frameIndex = 0;
        let animationFrameId: number;
        // 24 FPS target
        const fps = 24;
        const interval = 1000 / fps;
        let lastTime = 0;

        const render = (time: number) => {
            const delta = time - lastTime;

            if (delta > interval) {
                const img = images[frameIndex];

                // Only draw if image is fully loaded. 
                // Since we naive-preloaded, we check `complete`.
                if (img && img.complete && img.naturalHeight !== 0) {
                    // Draw 'cover' style
                    const w = canvas.width;
                    const h = canvas.height;
                    const imgRatio = img.width / img.height;
                    const canvasRatio = w / h;

                    let drawW, drawH, offsetX, offsetY;

                    // Apply 10% zoom to remove potentially baked-in black borders or watermarks
                    const ZOOM = 1.1;

                    if (canvasRatio > imgRatio) {
                        drawW = w * ZOOM;
                        drawH = (w / imgRatio) * ZOOM;
                        offsetX = (w - drawW) / 2;
                        offsetY = (h - drawH) / 2;
                    } else {
                        drawH = h * ZOOM;
                        drawW = (h * imgRatio) * ZOOM;
                        offsetX = (w - drawW) / 2;
                        offsetY = (h - drawH) / 2;
                    }

                    ctx.clearRect(0, 0, w, h);
                    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

                    frameIndex = (frameIndex + 1) % images.length;
                }

                lastTime = time - (delta % interval);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isLoaded, images, isVisible]);

    // Handle Resize with DPI Scaling and Mobile Scroll Protection
    useEffect(() => {
        const handleResize = () => {
            if (!canvasRef.current) return;

            const width = window.innerWidth;
            const height = window.innerHeight;
            const dpr = window.devicePixelRatio || 1;

            // Protection against mobile address bar flickering:
            // Only re-initialize if width changes or height changes significantly (> 100px)
            const heightDiff = Math.abs(height - lastDimensions.current.height);
            const widthChanged = width !== lastDimensions.current.width;

            if (!widthChanged && heightDiff < 100 && lastDimensions.current.height !== 0) {
                return;
            }

            lastDimensions.current = { width, height };

            // Apply DPI Scaling
            canvasRef.current.width = width * dpr;
            canvasRef.current.height = height * dpr;
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-black select-none pointer-events-none">
            {/* Fallback while loading */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-black flex items-center justify-center opacity-50 z-10 transition-opacity duration-500">
                    <img src="/swiss_alps_hero.png" className="w-full h-full object-cover opacity-30" alt="Loading" />
                </div>
            )}

            <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block object-cover"
                />
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-20" />
        </div>
    );
}
