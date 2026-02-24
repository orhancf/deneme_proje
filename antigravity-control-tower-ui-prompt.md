# Antigravity Prompt — Corporate Control Tower UI (Glass + Bento + Premium)

> Amaç: Antigravity içinde (agent-first) çalıştıracağın tek bir prompt ile **kurumsal / tedarik zinciri kontrol kulesi** tarzında, **akıcı–profesyonel–premium** hissi veren bir UI tasarım dili ve uygulanabilir frontend çıktıları üretmek.

---

## 0) Kullanacağın “Master Prompt” (kopyala-yapıştır)

**ROLE**
You are a senior Product Designer + Design System Architect + Frontend Lead.  
You will design a **Supply Chain Control Tower** web app (corporate, data-dense, premium).  
Your output must be implementable (tokens + component specs + interaction rules + sample code scaffolds).

**CONTEXT**
- Product: Reporting-first “Control Tower” dashboard for supply chain operations (inventory, orders, suppliers, production, logistics).
- Users: planners, procurement, ops leaders, analysts (daily use, data-heavy).
- Feel: **premium, calm, confident, modern**. Not flashy. High readability.
- Style: **Enterprise base** (Fluent/Material discipline) + **Glass overlays** + **Bento grid layout**.
- Priority: clarity > decoration. Glass is used only where it helps hierarchy.

**TECH / STACK (assume React ecosystem)**
- Styling: `tailwindcss` (utility-first)
- Component foundation: `shadcn-ui/ui` + `radix-ui/primitives` (accessible primitives)
- Tables: `TanStack/table`
- Charts: choose 1 primary (either `recharts/recharts` or `apache/echarts`)
- Dashboard blocks (optional accelerator): `tremorlabs/tremor` or Tremor templates

**HARD RULES**
1. Data readability is non-negotiable: contrast, spacing, and hierarchy first.
2. “Glass” is a *layer*, not the whole UI. Use it for: topbar, side panel, filter drawer, modals, floating action surfaces.
3. Main content cards remain mostly solid (slight elevation), so charts/tables stay crisp.
4. Dark mode-first (industrial premium), but deliver light mode tokens too.
5. Use a 4/8px spacing system and consistent radius/shadow scale.
6. Provide exact token names and values (CSS variables) and Tailwind mapping.
7. Provide component specs with states: default/hover/active/disabled/focus/error/success/loading.
8. Provide motion rules (durations/easing) and accessibility notes (keyboard, aria, focus).

**DELIVERABLES (OUTPUT FORMAT)**
Produce the following sections in order:

### 1) Design Language Snapshot (1 page)
- 6–8 bullet principles
- “Do / Don’t” list for Glass + Bento usage
- Example: what “premium control tower” means in typography, color, spacing

### 2) Design Tokens (ready for code)
Provide:
- Color tokens (dark + light): background/surface/overlay/border/text/brand/semantic
- Typography tokens: font families, sizes, weights, line-heights
- Spacing scale, radius scale, shadow scale
- Blur tokens for glass (levels) + opacity rules
- Data visualization palette rules (avoid rainbow; consistent series mapping)

Output as:
- `:root` CSS variables
- a Tailwind theme snippet mapping tokens

### 3) Layout System (Bento Grid)
- App shell: topbar + left nav + content + right context panel (optional)
- Grid rules: column counts (desktop/tablet), card sizing, density modes (compact/comfortable)
- Page templates:
  - Executive Overview (KPI + trend + alerts)
  - Inventory & Service Level
  - Open Orders / Backlog
  - Supplier Performance
  - Production Plan & Capacity

### 4) Component Blueprint (Design System)
For each component, give: anatomy, variants, states, props, accessibility notes.
Minimum set:
- Navigation: sidebar (collapsed/expanded), breadcrumb, tabs
- Data: KPI card, trend sparkline, alert banner, status pill, progress, empty state
- Inputs: search, filter chips, date range, segmented control, multi-select
- Tables: dense table, sticky header, row actions, column config
- Overlays: modal, drawer, popover, tooltip, command palette
- Feedback: toast, skeleton, inline validation, loading overlay

### 5) Interaction & Motion Spec
- Micro-interactions: hover elevation, pressed state, focus ring
- Transitions: 150–250ms, consistent easing
- Page transitions: subtle (no heavy animations)
- Reduce motion fallback

### 6) Example Screen (written spec + pseudo layout)
Describe one key screen in detail:
“Inventory Control Tower”
- sections, grid placement, filters, main KPIs, table, chart, alerts
- include a small JSON describing layout blocks

### 7) Implementation Starter Pack
- Folder structure suggestion
- Which libraries map to which components (shadcn/radix/tanstack/recharts/echarts/tremor)
- 10-step build plan (MVP → v1)
- Quality gates: accessibility, performance, consistency

**QUALITY BAR**
- Avoid generic UI advice. Be specific and prescriptive.
- Every recommendation must be justified by readability, scalability, or maintainability.
- Keep the tone concise and technical.

Now produce the deliverables.
