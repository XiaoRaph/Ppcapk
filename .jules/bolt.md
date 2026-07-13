# Bolt's Performance Journal

This journal tracks performance bottlenecks, optimizations, and learnings specific to this repository.

## 2025-05-18 - High-Frequency Re-renders in Pong Game
**Learning:** React Native Web screens that run on `requestAnimationFrame` (such as `PongGameScreen`) re-render up to 60 times per second. During gameplay, non-moving components (such as headers, scoreboard, centered dashed lines, and control panels) are repeatedly re-rendered and their nested sub-components/arrays re-allocated, causing CPU overhead.
**Action:** Use `useMemo` to cache static and rarely-changing UI sub-trees (header, controls, scoreboards, board layout components) to isolate state updates to the fast-moving elements (ball and paddles).
