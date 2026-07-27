# Palette UX Journal

## 2025-05-18 - Accessibility on Navigation Buttons
**Learning:** In React Native Web, icon-only buttons or text buttons with emoji require proper accessibility attributes such as `accessibilityLabel` or `aria-label` to ensure they are readable by screen readers.
**Action:** Always provide `accessibilityLabel` or `accessibilityRole` to interactive components like `TouchableOpacity` in React Native to facilitate screen reader usage.

## 2026-07-12 - Synchronous State Access in React Native Web Keydown Event Listeners
**Learning:** In React Native Web, when implementing physical keyboard event listeners (`keydown`) for real-time arcade games like Snake, rapid successive keystrokes can suffer from stale closure issues if they refer to the React state directly.
**Action:** Use a `useRef` to store and update a reference to the latest state (e.g., `directionRef.current = direction`) synchronously. Refer to this ref within your keyboard listener or callbacks (`handleDirectionChange`) to guarantee immediate and bug-free state transitions.

## 2026-07-13 - Visual Keyboard Badges and Shortcuts for Web Navigation
**Learning:** In React Native Web arcade platforms, adding desktop keyboard navigation (keys '1'-'9' and modal controls) accompanied by neat, conditional visual key badges significantly enhances both visual delight, accessibility, and intuitive navigation for desktop power users.
**Action:** When targeting the Web platform from a React Native codebase, conditionally render distinct, theme-integrated key badge hints next to interactive list items, and manage global document keyboard listeners carefully with proper cleanups in a `useEffect`.

## 2026-07-14 - Screen Reader Hygiene for Keyboard Badges on React Native Web
**Learning:** Adding visual keyboard badge hints (such as `[1]` or `[Entrée]`) directly to interactive buttons can create repetitive noise for screen readers, which already announce the button's action and identity.
**Action:** Hide decorative or redundant visual key badge labels from screen readers by wrapping them in dedicated elements styled/configured with `accessibilityElementsHidden={true}` and `importantForAccessibility="no"`.
