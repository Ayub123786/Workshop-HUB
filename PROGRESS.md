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

- [x] **Part 2: Hub Page Upgrade** (COMPLETED)
  - **Live Database Stats**: Animated CountUp counters under Hero CTA for Total Workshops Hosted, Professionals Trained, Financial Hubs/Countries, and AUM Across Trained Funds, wired to `GET /api/workshops/stats/hub`.
  - **Featured Workshop**: Split card layout carousel with countdown and dual CTAs.
  - **Next Session Countdown Strip**: Days, hours, minutes, and seconds live ticker strip with one-click reserve.
  - **View Switcher (Grid | List | Calendar | Timeline)**: URL query parameter sync (`?view=...`), instant text search, category chips, status filter (All, Upcoming, Live, Completed), date range (Any time, This month, Next month), access price filter (Free, Executive Pass), and sorting (Soonest, Newest, Most Popular). Active filter chips with "Clear all" button and live results count.
  - **List View**: Wide row cards (`WorkshopListCard`) with prominent date blocks, category and status badges, speaker info, time zones, seats bar, and CTA.
  - **Timeline View**: Vertical chronological timeline (`WorkshopTimeline`) grouped by month with connecting lines, active status node dots, and event cards.
  - **Past Sessions**: Completed master classes with resources CTA and inline "Notify me when these rerun" email capture.
  - **Platform FAQ Accordion**: Interactive questions covering prerequisites, live interactivity, corporate invoices, waitlist policies, and curriculum access.
  - **Newsletter Collection**: Dedicated newsletter signup section connected to `Subscriber` collection via `POST /api/subscribers` with calm checkmark feedback.

- [x] **Part 3: Calendar System** (COMPLETED)
  - **date-fns Custom Calendar**: Zero-bloat custom month grid and agenda view with prev/next navigation, "Today" jumper, and month title.
  - **Event Dots & Category Legend**: Category-coded event dots and chips, multi-day spanning, muted past days, and outlined current day.
  - **Interactive Side Panel & Bottom Sheet**: Selecting any date displays a smooth side panel (desktop) or sheet (mobile) with that day's sessions, converted time, seats left, and action buttons.
  - **Time Zone Converter**: Live selector for Dubai (GST), New York (EST), London (GMT), and auto-detected local browser timezone via `Intl.DateTimeFormat`, persisted in `localStorage`.
  - **Universal Add to Calendar**: Google Calendar link, Outlook link, and RFC 5545 `.ics` file download available on calendar cards, list rows, and quick view drawers.
  - **Public iCal Feed**: Dedicated `/api/calendar.ics` server endpoint exposing all upcoming published master classes with a one-click subscription modal.

- [x] **Part 4: Event Detail & Registration** (COMPLETED)
  - **Quick View Drawer**: Right-side slide-over drawer triggered by any workshop card without navigating away. Displays workshop banner, category, title, live status badge, converted timezone time, visual seats-left progress bar, Ayub speaker profile with bio, 3 key takeaways, universal calendar export (Google/Outlook/ICS), social share buttons, and primary Reserve CTA.
  - **Sticky Subnav with Scroll-Spy**: In-page floating subnav bar on workshop details page with active section indicators highlighting `#overview`, `#agenda`, `#speaker`, `#reviews`, and `#faq` on scroll.
  - **Desktop Floating Registration Card**: Sticky right-side executive enrollment card featuring converted date/time with interactive timezone switcher, live capacity progress bar ("X spots left"), price badge ("Executive Access - Free"), primary Reserve/Waitlist button, "Add to Calendar" dropdown, and share triggers.
  - **Mobile Sticky Bottom CTA Bar**: Sleek mobile bottom bar with quick title, seat countdown, and instant "Reserve Spot" button.
  - **Multi-Step Registration Modal**: Two-step modal (Attendee Details -> Executive Review & Confirmation) with real-time inline validation, waitlist mode for sold-out cohorts, honeypot spam protection, and a calm success state with gold checkmark, calendar addition links, and deal-team share tools.
  - **Prerequisites & Deal Team Share Bar**: Prerequisites callout block and share bar supporting 1-click clipboard copy, LinkedIn, X, WhatsApp, and mailto.
  - **Related Workshops Series**: Bottom 3-column curated grid of upcoming masterclasses in the same topic or category with quick registration access.
  - **Completed Workshops Experience**: Dedicated rerun banner, recording request, and inline email capture notification form for past sessions.
  - **JSON-LD Schema**: Full Schema.org `EducationEvent` structured data in `<head>` for rich Google search result indexing and calendar integration.

- [ ] **Part 5: Platform Enhancements** (Bookmarks/saved filter, automated email reminders, dismissible announcement bar, Cmd+K global search palette, empty/skeleton states)
- [ ] **Part 6: Admin Additions & Data Seeding** (Admin drag-calendar, expanded workshop schema fields, waitlist/subscriber CSV export, analytics dashboard, test data seeding)

