# Code In The Dark - UX/UI Design Guidelines & Core Principles

This document outlines the core UX/UI design principles for **Code In The Dark**, synthesized from industry best practices (GeeksforGeeks UI/UX Design Principles) and adapted to our unique 2D Pixel-Art Egyptian Retro aesthetic.

---

## 🏛️ Core Principles of UI/UX Design

### 1. Simplicity & Clarity (ความเรียบง่ายและชัดเจน)
- **Principle:** The interface must be easy to navigate with minimal cognitive effort. Clarity always trumps over-complicated aesthetics.
- **Project Rule:** Keep screen layouts focused. Important actions (such as starting the game or logging in) should be obvious without cluttering the screen with unnecessary text or icons.

### 2. User-Centered Design & Accessibility (ผู้ใช้เป็นศูนย์กลางและการเข้าถึงง่าย)
- **Principle:** Designs must prioritize the user's needs and be accessible to all players regardless of screen size or device constraints.
- **Project Rule:** 
  - Ensure high color contrast (e.g., bright cream `#fde68a` or gold text against deep brown `#5c2e0b` / warm desert backgrounds).
  - Avoid cold pure white `#ffffff` borders or pure `#000000` shadows in warm environment scenes to maintain visual harmony while preserving high contrast for readability.
  - Maintain legible typography (VT323 pixel font at readable sizes).

### 3. Visibility & Visual Hierarchy (การมองเห็นและลำดับความสำคัญสายตา)
- **Principle:** High-priority elements must stand out immediately, guiding the user's eyes naturally through the task flow.
- **Project Rule:** 
  - Primary Call-To-Action (CTA) elements must use high-contrast container styling (e.g., deep brown `#5c2e0b` or terracotta `#9a3412` frames for light buttons) so they never "sink" or blend into background cards/scrolls.
  - Text sizes follow strict hierarchy: Screen Titles (9xl/8xl) > Modal Headings (4xl/3xl) > Subtitles/Labels (2xl/xl) > Body text.

### 4. Consistency & Brand Authority (ความสม่ำเสมอของสไตล์และโทนสี)
- **Principle:** Consistent design elements (colors, typography, component styles) build user trust, familiarity, and a strong brand identity.
- **Project Rule:** 
  - **Warm Desert Palette:** Stick strictly to warm Egyptian tones — Sands (`#fde68a`, `#fef3c7`), Oranges (`#d97706`, `#b45309`), Browns (`#8b4513`, `#5c2e0b`, `#382503`).
  - **Chunky 3D Pixel Aesthetic:** Buttons and cards should consistently feature retro pixel borders (`border-4`, `box-shadow` depth) rather than flat modern web rounded boxes.

### 5. Feedback & Affordance (การตอบสนองและสัญลักษณ์การใช้งาน)
- **Principle:** Every action performed by the user must trigger clear, immediate visual or motion feedback.
- **Project Rule:** 
  - All interactive elements must react to hover (`hover:-translate-y-1`, `hover:scale-105`) and active click states (`active:translate-y-1` with reduced shadow).
  - Action results (e.g., login errors, code run attempts) trigger visual pulses or clear message banners.

### 6. Modal UX & Clear Exits (การจัดการหน้าต่างป๊อปอัป)
- **Principle:** Modals must have unambiguous exit points to reduce cognitive load and avoid user frustration.
- **Project Rule:** Use a clean, universally recognized 'X' icon (e.g., `&#10006;`) positioned neatly at the top-right corner of modal containers. Avoid redundant text labels (like `← BACK`) when closing a pop-up.

### 7. Efficiency & Delight (ประสิทธิภาพและความน่าประทับใจ)
- **Principle:** The UI should be optimized for quick task completion while evoking positive emotional engagement.
- **Project Rule:** Smooth CSS keyframe animations (sliding titles, glowing pulsing prompts) draw users into the desert tomb adventure without causing performance lags.

---

## 🎯 Key Design Evaluation Criteria (Checklist)

| Criterion | Implementation in Code In The Dark |
| :--- | :--- |
| **Usefulness** | Direct access to single-player/co-op game modes and clear Blockly instructions. |
| **Desirability** | Immersive 16-bit retro Egyptian pixel art with warm sunset/tomb lighting. |
| **Accessibility** | High contrast warm font colors (`#fde68a`), legible pixel sizes, dark brown drop shadows. |
| **Usability** | Intuitive button placements, clear modal exits, readable status banners. |
| **Findability** | Clean visual hierarchy leading from screen titles down to CTAs. |
| **Value-Impact** | Seamless transition between landing, auth, lobby, and puzzle gameplay. |
