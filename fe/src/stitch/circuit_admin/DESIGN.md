# Design System Strategy: The Administrative Curatorship

This design system establishes a high-end, editorial-inspired framework for the 'Phone Store' administration environment. Moving beyond the utilitarian "spreadsheet" aesthetic of standard dashboards, this system treats data as premium content. It balances the high-density requirements of e-commerce management with an authoritative, modern interface characterized by tonal depth and structural breathing room.

## 1. Creative North Star: "The Digital Curator"
The system is built on the principle of **The Digital Curator**. Administrative tasks are often chaotic; the UI should act as a calming, organized force. 

*   **Intentional Asymmetry:** Break the rigid 12-column grid. Use wide margins for primary data tables paired with offset, narrower utility panels.
*   **Atmospheric Contrast:** A deep, authoritative Sidebar (`primary_container`: #001b54) anchors the experience, while the workspace breathes in a light, airy environment (`background`: #f9f9ff).
*   **Editorial Typography:** Large, characterful headings paired with highly legible, functional body scales to create a sense of hierarchy usually reserved for premium magazines.

## 2. Color & Surface Philosophy
The palette utilizes professional blues and purposeful status colors, governed by a strict non-linear separation rule.

### The "No-Line" Rule
Traditional 1px borders are prohibited for sectioning. Structural separation is achieved through:
*   **Background Shifts:** Distinguish a table header from its rows using a shift from `surface_container_low` (#f1f3ff) to `surface_container_lowest` (#ffffff).
*   **Tonal Nesting:** UI layers should follow a logical stack:
    1.  **Canvas:** `background` (#f9f9ff)
    2.  **Section Base:** `surface_container` (#e9edff)
    3.  **Actionable Cards:** `surface_container_lowest` (#ffffff)
    4.  **Raised Elements/Modals:** `surface_bright` (#f9f9ff) with ambient shadows.

### Glass & Gradient Accents
*   **The Deep Sidebar:** To mirror the header in the reference imagery, the sidebar uses `primary_container` (#001b54). For active states, apply a subtle linear gradient from `primary` (#000621) to `on_primary_container` (#5080ff) at a 15% opacity to create a "glow" rather than a flat block of color.
*   **Glassmorphism:** For floating tooltips or quick-view overlays, use `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur.

## 3. Typography
We utilize a dual-font strategy: **Manrope** for authoritative display and **Inter** for precision data.

| Level | Token | Font | Size | Weight | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-md` | Manrope | 2.75rem | 700 | Large analytics numbers |
| **Headline** | `headline-sm` | Manrope | 1.5rem | 600 | Page titles (e.g., "Product Catalog") |
| **Title** | `title-sm` | Inter | 1rem | 600 | Table headers and card titles |
| **Body** | `body-md` | Inter | 0.875rem | 400 | General data and description |
| **Label** | `label-sm` | Inter | 0.6875rem | 500 | Form labels and micro-metadata |

## 4. Elevation & Depth
Depth is a functional tool, not a stylistic flourish. It guides the user’s eye toward primary interactions.

*   **The Layering Principle:** Avoid shadows for static content. Instead, use a "Ghost Border" for card definition—an `outline_variant` (#c6c6cc) at 20% opacity. 
*   **Ambient Shadows:** For "floating" elements like Role Selection modals or Coupon detail popovers, use a multi-layered shadow:
    *   `0px 4px 20px rgba(20, 27, 43, 0.04)`
    *   `0px 12px 40px rgba(20, 27, 43, 0.08)`
*   **The Signature Softness:** All containers follow the `xl` (0.75rem) roundedness scale to soften the high-density data and make the interface feel modern and approachable.

## 5. Component Logic

### Tables (Data Density)
*   **Layout:** Remove all vertical dividers. Use `surface_container_low` for the header row.
*   **Interaction:** On hover, a row should transition to `surface_container_high` (#e1e8fd).
*   **Success/Delete Actions:** Use `secondary` (#006c49) for "Edit/Save" and `error` (#ba1a1a) for "Delete/Archive," but keep these as text-only or "ghost buttons" until hover to reduce visual noise in large tables.

### Input Fields
*   **Style:** Background `surface_container_lowest`, no border. Use a bottom-only 2px stroke of `outline_variant` that transitions to `surface_tint` (#0053db) on focus.
*   **Helper Text:** Always use `label-md` in `on_surface_variant` (#45474c).

### Buttons
*   **Primary:** A high-contrast combination of `primary_container` (#001b54) text on a `primary_fixed` (#dbe1ff) background.
*   **Success (Coupons/Orders):** `secondary` (#006c49) container with `on_secondary` (#ffffff) text.
*   **Danger:** `error_container` (#ffdad6) with `on_error_container` (#93000a) text.

## 6. Do's and Don'ts

### Do
*   **Do** use whitespace as a separator. If two sections feel cluttered, increase the padding (using the 4px base grid) rather than adding a line.
*   **Do** use `on_surface_variant` for secondary data (like Product IDs or timestamps) to create visual hierarchy within a single table cell.
*   **Do** ensure that "Success" messages use the `secondary_container` (#6cf8bb) to maintain the professional green tone.

### Don'ts
*   **Don't** use 100% black text. Always use `on_surface` (#141b2b) for primary content to maintain a high-end, softened contrast.
*   **Don't** use standard "drop shadows" on cards. Stick to tonal layering (Surface Container shifts).
*   **Don't** use high-saturation reds for every "Delete" action. Only use `error` (#ba1a1a) for final, destructive actions. For "Cancel," use a tertiary ghost button.