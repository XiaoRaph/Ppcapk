# Bolt's Performance Journal

This journal tracks performance bottlenecks, optimizations, and learnings specific to this repository.

## 2025-05-18 - High-Frequency Re-renders in Pong Game
**Learning:** React Native Web screens that run on `requestAnimationFrame` (such as `PongGameScreen`) re-render up to 60 times per second. During gameplay, non-moving components (such as headers, scoreboard, centered dashed lines, and control panels) are repeatedly re-rendered and their nested sub-components/arrays re-allocated, causing CPU overhead.
**Action:** Use `useMemo` to cache static and rarely-changing UI sub-trees (header, controls, scoreboards, board layout components) to isolate state updates to the fast-moving elements (ball and paddles).

## 2025-05-19 - High-Frequency Re-renders in Slop Local Game
**Learning:** High-frequency layout calculations and coordinate adjustments running on `requestAnimationFrame` (such as the gameplay updates in `SlopLocalGameScreen`) cause continuous complete Virtual DOM tree reconstructions. Static text cards (Intro Card, Dashboard, Query Monitor, overlays) and UI control rows get needlessly reallocated on every rendering tick.
**Action:** Wrap critical components and action controls in `useMemo` to enforce structural isolation. Use `useCallback` to cache parent-scoped click handlers and functions.
