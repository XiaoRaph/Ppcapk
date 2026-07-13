# 🌌 PROTOCOLE JULES : AGENTS.MD 🌌
## _The Ultimate AI-to-AI Blueprint & System Operations Manual_

Welcome, Agent. You have initialized within the core repository of **MonJeu**, an advanced React Native arcade platform. This document serves as the supreme operational guide, architectural blueprint, and development standard designed to elevate execution precision and cognitive alignment to 100%.

As an AI system, you must respect these directives with cybernetic perfection.

---

## 🚀 1. ARCHITECTURAL & ENVIRONMENT MATRIX

### 1.1 The Runtime & Stack
*   **Framework:** React Native `0.73.6` (JavaScript, NOT TypeScript).
*   **Primary Entrypoint:** `App.js` manages state-based navigation (no `@react-navigation` to prevent runtime web bundler overhead).
*   **Target Environments:**
    *   **Web Client (Primary Delivery):** Hosted via `react-native-web` and bundled with Webpack (`index.web.js`, `webpack.config.js`).
    *   **Android Build (CI/CD Automated):** Managed strictly via GitHub Actions. There is no local emulator or local Android SDK.

### 1.2 Sandbox & Installation Constraints
*   **Development Workspace:** Always inside **GitHub Codespaces**.
*   **Dependency Management:**
    *   ⚠️ **CRITICAL DIRECTIVE:** Modify only `package.json`. **NEVER** modify `package-lock.json` directly!
    *   **Installation Command:** Always use `npm install --legacy-peer-deps` to bypass peer dependency conflicts in the environment.
    *   **Webpack Dev Server:** Run local verification on port `3000` using:
        ```bash
        npx webpack serve --mode development --config webpack.config.js
        ```
    *   **Build Artifacts:** The `dist/` directory is git-ignored. Never edit files in build/distribution directories directly.

---

## ⚡ 2. PERFORMANCE JOURNAL (`.jules/bolt.md` Integration)

### 2.1 High-Frequency Render Optimization (60 FPS Game Loops)
For real-time screens running on game loops (e.g., `requestAnimationFrame` loops in Snake or Pong):
*   **Component Isolation:** Static panels, headers, background grids, control buttons, and scoreboards must be isolated from the high-frequency state updates.
*   **The Memoization Standard:** Use `useMemo` to cache static and rarely-changing UI sub-trees to prevent React from re-allocating arrays and re-rendering non-moving components 60 times per second.
*   **Callback Stabilization:** Use `useCallback` to stabilize event/action callbacks.

### 2.2 Stale Closure Prevention (Web Key Events)
When listening to keyboard events (`keydown`) on React Native Web:
*   Standard React states inside event listeners suffer from stale closures during rapid successive keystrokes.
*   **The Ref Pattern:** Always store dynamic inputs/state (e.g., `direction`) in a `useRef` (e.g., `directionRef.current = direction`) synchronously. Refer strictly to the `.current` of the ref inside your event handlers to guarantee instant, bug-free gameplay responsiveness.

---

## 🛡️ 3. SECURITY & DEFENSIVE ENGINEERING (`.jules/sentinel.md` Integration)

### 3.1 Parameter & Argument Validation
*   **The Vulnerability:** Client-side Denial of Service (DoS) due to unhandled `TypeErrors`. If a state or action handler expects a specific payload format (e.g., `choiceName`) and receives an unexpected value from UI states or simulated actions, reading properties on `undefined` will crash the application.
*   **Defensive Practice:** Always implement rigorous argument validation against a strict whitelist or expected schema within component action handlers and event handlers.
    ```javascript
    const handleChoice = (choiceName) => {
      const VALID_CHOICES = ['Pierre', 'Papier', 'Ciseaux'];
      if (!choiceName || !VALID_CHOICES.includes(choiceName)) {
        console.warn(`Invalid action parameter: ${choiceName}`);
        return;
      }
      // Safe execution logic...
    };
    ```

### 3.2 Content Security Policy (CSP)
*   Ensure that the CSP meta tag configured in `public/index.html` is never weakened, keeping strict control over resource domains to prevent Cross-Site Scripting (XSS) or illegal injection vectors.

---

## 🎨 4. UX, RESPONSIVE LAYOUTS & ACCESSIBILITY (`.jules/palette.md` Integration)

### 4.1 Viewport Configuration (Full-Screen Immersion)
To ensure the arcade experience perfectly occupies the browser viewport:
*   **HTML Elements:** In `public/index.html`, style `html`, `body`, and `#root` with `height: 100%`, `margin: 0`, and `overflow: hidden`.
*   **Root Layout:** The root View in `App.js` must be styled with `flex: 1`, `height: 100%`, and `width: 100%`.
*   **Responsive Calculations:** When computing board layouts, dynamically fetch dimensions using `Dimensions.get("window")` and subtract all vertical offsets (headers, menu buttons, scoreboard heights) to prevent clipping or viewport overflows.

### 4.2 Web & Screen Reader Accessibility
*   **Interactive Components:** Every touchable or interactive element (e.g., `TouchableOpacity`) must have an explicit `accessibilityRole` (e.g., `"button"`), an explicit, localized `accessibilityLabel`, and a clear `accessibilityHint`.
*   **Decorative Elements:** Emojis or purely cosmetic visual elements must be hidden from screen readers to prevent noise. Style them with `accessibilityElementsHidden={true}` and `importantForAccessibility="no"`.

---

## 🤖 5. THE JULES WORKFLOW PROTOCOLS

### 5.1 Verification Checklist (Verify Everything)
1.  **State Consistency:** After writing or altering any file, you must run a read-only tool (`read_file`, `list_files`) to confirm the file has updated cleanly without corruption.
2.  **No Regression:** Run Jest tests with `npm test` before pushing.
3.  **Local Dev Check:** Ensure Webpack builds are clean with `npm run build:web`.

### 5.2 Commit and Push Mechanics
*   **Pull Requests:** Automated merging is enabled! The workflow `.github/workflows/label-jules-pr.yml` automatically labels PRs authored by `google-labs-jules[bot]` with `automerge`.
*   Keep the branch names clean, and write concise, highly descriptive commit messages following professional git conventions.

---

*“Code is poetry, optimization is truth, security is peace.”* – Jules 🌌
