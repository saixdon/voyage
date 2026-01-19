# Globe Tour Mode Design Plan

## Overview
The user requests a "Tour Mode" for the interactive globe. This feature will automatically rotate the globe between trending destinations, simulating a "video" experience where the user sits back and watches the globe move and display information about different places. The user also wants "Stecknadel" (Pin) style markers that are clearly visible.

## Features

### 1. Enhanced Pin Design
- **Visuals**: Use a clear, 3D-style "Pin" icon that stands out against the dark globe.
- **Visibility**: Ensure pins are distinct and do not get lost in the map texture.
- **Interaction**: Pins should be clickable and hoverable (already implemented, but needs refinement).

### 2. Tour Mode (Auto-Rotation)
- **"Start Tour" Action**: A button to initiate the automated tour.
- **Behavior**:
    1.  The globe smoothly rotates to the first destination.
    2.  The destination's "Pin" becomes active/highlighted.
    3.  The detailed tooltip opens automatically.
    4.  An animation (e.g., Ken Burns effect on the image) plays to simulate video.
    5.  After a set duration (e.g., 8 seconds), the globe rotates to the next destination.
- **Controls**:
    -   **Play/Pause**: Toggle the automatic progression.
    -   **Next/Prev**: Manually skip to the next or previous destination.
    -   **Exit**: distinct button to stop the tour and return to free exploration.

### 3. Video/Animation Logic
- **Constraint**: we do not have actual video files for every destination.
- **Solution**: Use CSS animations on the high-quality destination images (Pan & Zoom / Ken Burns effect) to create a dynamic, video-like feel within the tooltip during the tour.

## Technical Implementation

### Components
- **`GlobeDestinations.tsx`**:
    -   State: `isTouring` (boolean), `tourIndex` (number), `isPaused` (boolean).
    -   Effect: A timer loop that triggers when `isTouring` is true and `!isPaused`. It increments `tourIndex` every N seconds.
    -   Effect: Updates `globeRef.current.pointOfView` whenever `tourIndex` changes to center the new destination.

### Design System
-   New `TourControls` overlay component.
-   Enhanced CSS for `.pin-marker` and `.tooltip-image`.

## Success Criteria
-   User can start a tour.
-   Globe rotates automatically.
-   Pins look like distinct "Stecknadeln".
-   "Video-like" animation plays in the tooltip.
-   User can interrupt or control the tour.
