# Workshop Hub UI & Major Features — Progress Log

## Audit Summary (Baseline)

### Current Architecture
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Framer Motion, Lucide React, Helmet Async, Lenis smooth scrolling.
- **Backend**: Express.js, Supabase PostgreSQL with local JSON fallback, Supabase Storage (`workshop-hub` bucket).
- **Design Language**: "Minimal Light" — White background (`#FFFFFF`), near-black text (`#0A0A0A`), ONE gold accent (`#C8A24F`), thin 1px borders (`#E8E8E8`), Inter font, 12-16px border-radius, Lucide icons, no gradients.

### Audited Deficiencies & Visual Bugs
1. **Navbar**:
   - Background was semi-transparent without solid white backdrop-blur base, causing it to blend into hero text.
   - Missing 80px hero padding offset; content risked clipping under navbar.
   - Active link gold underline missing (used dark background pills instead).
   - Links lacked `Calendar` and `About` anchors.
   - Button had external link icon and labeled "Register" instead of "Reserve a Spot" with smart modal/scroll target.
   - Mobile hamburger menu needed slide-down drawer animation.
   - Duplicate scroll progress bar was fixed at top of screen rather than pinned to the 2px bottom edge of navbar.
2. **Status Logic & Badges**:
   - `sold-out` was overriding `completed` for past workshops with full seats (e.g., `family-office-deal-sourcing`).
   - Badges lacked unified solid pill design with top-right image positioning and readable typography.
   - Few Spots Left (<20% remaining) badge missing.
   - Public view previously allowed draft/non-hub items to leak if status was requested.
3. **Card Consistency**:
   - Cards in grid rows did not enforce equal height flex column with bottom-pinned CTAs.
   - Fixed 16:10 aspect ratio and thin seat progress bars were absent.
4. **Featured Workshop**:
   - Used text over dark gradient on image instead of clean Minimal Light split card layout.
   - Lacked carousel navigation for multiple featured workshops.
5. **Trust & Social Proof**:
   - Firms marquee and verified attendee badges needed refinement with "Read more" modal/drawer.

---

## Roadmap & Status

- [x] **Part 1: Fix Visual Bugs** (COMPLETED)
  - **Sticky Navbar**: Solid white background (`rgba(255,255,255,0.85)` + `backdrop-blur-md`), 1px bottom border (`#E8E8E8`), subtle scroll shadow. Added 80px hero padding offset (`pt-20 sm:pt-24`) so content never sits under navbar. Active link gold underline with Framer Motion spring layout. Clean links (`Workshops`, `Calendar`, `Upcoming`, `Past`, `About`). Smart "Reserve a Spot" button without external link icon. Mobile hamburger menu with slide-down drawer. 2px gold progress bar pinned to navbar bottom edge.
  - **Solid Status Badges**: Unified solid pills with high-contrast text positioned top-right on card images: `Upcoming` (gold bg, dark text), `Live Now` (red dot pulsing, white bg), `Sold Out` (black bg, white text), `Completed` (gray bg, white text), `Few Spots Left` (amber bg, white text, when under 20% seats). Category chip placed top-left in white pill with 1px border. Never displays admin/draft statuses publicly.
  - **Status Logic**: Server and client unified via `workshopStatus.js` and `Workshop.js`. Completed workshops never appear under Upcoming and cannot show waitlist. Waitlists restricted to upcoming sold-out workshops. Public routes strictly filter `status: 'published'` and `showOnHub: true`.
  - **Equal Height Cards**: Grid with flex column and bottom-pinned CTA buttons. Fixed 16:10 image ratio with `object-cover`. Thin visual progress bar showing capacity fill and "X spots left".
  - **Split Featured Banner**: Replaced text-over-image with clean Minimal Light split layout: Left has category chip, gold Featured badge, title, description, date/timezones, live countdown strip, and dual CTAs ("Reserve Your Spot" and "View Full Curriculum"). Right has 16:10 rounded image filling the full card edge. Multi-workshop carousel support with arrows and dot indicators.
  - **Firms We've Trained & Testimonials**: Animated CountUp AUM counter card, slow infinite marquee of trained institutional firms, and 2-column verified attendee testimonials with "Verified attendee" badges and "Read more testimonials" toggle.

- [ ] **Part 2: Hub Page Upgrade** (Live database stats, countdown strip, View Switcher: Grid/List/Calendar/Timeline with URL query sync, past sessions, FAQ accordion, newsletter subscribers)
- [ ] **Part 3: Calendar System** (date-fns month view, event dots, side panel/bottom sheet, agenda mode, time zone converter, .ics generation & subscribe feed)
- [ ] **Part 4: Event Detail & Registration** (Quick View right-side drawer, full workshop page additions, multi-step registration modal with waitlist & confirmation)
- [ ] **Part 5: Platform Enhancements** (Bookmarks/saved filter, automated email reminders, dismissible announcement bar, Cmd+K global search palette, empty/skeleton states)
- [ ] **Part 6: Admin Additions & Data Seeding** (Admin drag-calendar, expanded workshop schema fields, waitlist/subscriber CSV export, analytics dashboard, test data seeding)
