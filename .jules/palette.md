# Palette UX Journal

## 2025-05-18 - Accessibility on Navigation Buttons
**Learning:** In React Native Web, icon-only buttons or text buttons with emoji require proper accessibility attributes such as `accessibilityLabel` or `aria-label` to ensure they are readable by screen readers.
**Action:** Always provide `accessibilityLabel` or `accessibilityRole` to interactive components like `TouchableOpacity` in React Native to facilitate screen reader usage.

## 2026-07-12 - Synchronous State Access in React Native Web Keydown Event Listeners
**Learning:** In React Native Web, when implementing physical keyboard event listeners (`keydown`) for real-time arcade games like Snake, rapid successive keystrokes can suffer from stale closure issues if they refer to the React state directly.
**Action:** Use a `useRef` to store and update a reference to the latest state (e.g., `directionRef.current = direction`) synchronously. Refer to this ref within your keyboard listener or callbacks (`handleDirectionChange`) to guarantee immediate and bug-free state transitions.
