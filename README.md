# GraphRec Frontend

A React + TypeScript frontend for the GraphRec backend: an educational
platform where viewing, liking, and completing tutorials builds a graph
of relationships that a recommendation engine then traverses to surface
personalized tutorials.

This app consumes the real backend API — there is no mock data, no fake
authentication, and no invented endpoints anywhere in this codebase.

---

## 1. Backend API contract (source of truth)

Extracted directly from the backend source (routes, controllers,
repositories, validators) before writing any frontend code:

| Method | Endpoint | Auth | Request | Response `data` | Frontend usage |
|---|---|---|---|---|---|
| GET | `/health` | – | – | `{status, uptimeSeconds}` | not called by the UI |
| GET | `/health/db` | – | – | `{status, address, agent}` | not called by the UI |
| POST | `/api/auth/register` | – | `{name, email, password}` | `{user, token}` | `RegisterPage` → `AuthContext.register` |
| POST | `/api/auth/login` | – | `{email, password}` | `{user, token}` | `LoginPage` → `AuthContext.login` |
| GET | `/api/auth/me` | Bearer | – | `{user}` | `AuthContext.refreshUser` (session restore on load) |
| GET | `/api/users/me` | Bearer | – | `{user}` | `ProfilePage` |
| POST | `/api/tutorials` | Bearer | tutorial fields | `{tutorial}` | exposed in `api/tutorials.api.ts`, not wired to a page (no "create tutorial" UI was requested) |
| GET | `/api/tutorials` | – | `?difficulty=&limit=&offset=` | `{tutorials, count}` | `LandingPage`, `TutorialsPage`, `DashboardPage` |
| GET | `/api/tutorials/:id` | – | – | `{tutorial}` (with `topics`, `skills`, `instructor`, `course`) | `TutorialDetailsPage` |
| PATCH / DELETE | `/api/tutorials/:id` | Bearer | — | — | exposed in the API layer, no UI requested them |
| POST | `/api/tutorials/:id/view` | Bearer | – | `{interaction}` | `TutorialDetailsPage`, fired once per tutorial opened |
| POST | `/api/tutorials/:id/like` | Bearer | – | `{interaction}` | `TutorialDetailsPage`, "Like" button |
| POST | `/api/tutorials/:id/complete` | Bearer | – | `{interaction}` | `TutorialDetailsPage`, "Mark complete" button |
| GET | `/api/recommendations` | Bearer | `?limit=` | `{recommendations[], count, usedFallback}` | `DashboardPage` |

Envelope: every success response is `{success: true, data: {...}}`; every
error is `{success: false, error: {message, code, details?}}`. This is
handled centrally in `src/api/axios.ts` (`extractErrorMessage`) — no page
component parses raw error shapes itself.

### Backend inconsistencies found (and how the frontend handles them)

1. **`GET /api/tutorials` (list) omits `topics`/`skills`/`instructor`/`course`** — only
   `GET /api/tutorials/:id` includes them (see `tutorial.repository.js`:
   `list()` vs `findById()`). So `TutorialCard` (used on the discovery
   grid, dashboard, and landing page) only renders difficulty/duration —
   topic and skill badges appear only on `TutorialDetailsPage`, where the
   data actually exists. I did not fetch the detail endpoint per-card to
   fake it in the grid; that would be N+1 requests for cosmetic data.
2. **No endpoint for "my liked/completed tutorials."** There's no
   `GET /api/users/me/liked` or similar. `ProfilePage` says so directly
   instead of fabricating a history list — see the component for the
   exact wording.
3. **No per-user interaction state on a tutorial.** `GET /api/tutorials/:id`
   doesn't say whether *this* user already liked/viewed/completed it —
   there's no join against the current user's relationships. So the
   Like/Complete button states (`Liked ✓`, `Completed ✓`) only reflect
   actions taken in the current session and reset on reload. Flagged in
   a code comment in `TutorialDetailsPage.tsx` rather than left silently
   inconsistent.
4. **`GET /api/tutorials`'s `count` is a page count, not a total.** The
   backend returns `count: tutorials.length` (see `tutorial.controller.js`
   `listTutorials`), i.e. how many rows came back in *this* page — not
   how many tutorials exist in total. `TutorialsPage` therefore uses
   "did a full page come back?" to decide whether to show a Next button,
   rather than rendering a fabricated total-pages count.

Two dashboard sections from the original spec ("Continue learning",
"Explore topics") aren't implemented: there's no backend endpoint for
in-progress tutorials or for listing topics as a standalone resource, and
the instructions were explicit not to build sections around
non-existent APIs.

---

## 2. Architecture

```
Browser
  ↓
React components (pages/)
  ↓
Hooks (useAuth, useTutorials, useRecommendations) / AuthContext
  ↓
API layer (api/*.api.ts)
  ↓
Axios client (api/axios.ts) — attaches Bearer token, normalizes errors
  ↓
REST API (VITE_API_BASE_URL)
  ↓
GraphRec backend (Express → Neo4j driver → Bolt → CognoDB)
```

State management: React Context for auth (the one genuinely
cross-cutting piece of state), local component state and small custom
hooks (`useTutorials`, `useRecommendations`) for everything else. No
Redux/Zustand/React Query — the data-fetching needs here (a handful of
GET endpoints, no complex caching/invalidation graph) don't justify the
extra dependency.

---

## 3. Authentication

The backend returns a JWT in the response body (not an HTTP-only
cookie), so there's no cookie-based flow to configure — the frontend
must hold onto the token itself to attach it as `Authorization: Bearer
<token>` on subsequent requests. It's stored in `localStorage`
(`api/axios.ts`, `TOKEN_STORAGE_KEY`). This is the practical consequence
of the backend's chosen auth mechanism: a token-in-body API has no way
to be XSS-safe the way an httpOnly cookie would be, regardless of where
the frontend stashes it afterward.

- **Login/Register** → token stored, `AuthContext.user` set.
- **Session restore on page load** → if a token exists in storage,
  `GET /api/auth/me` is called once; success populates `user`, failure
  clears the token (handles expired/invalid tokens found on load).
- **Expired/invalid token on any later request** → the Axios response
  interceptor catches any 401, clears the stored token, and resets
  `user` to `null`. There is no refresh-token flow because the backend
  doesn't implement one — a 401 always means "log in again."
- **Protected routes** (`/dashboard`, `/profile`) are enforced by
  `ProtectedRoute`, which redirects to `/login` (preserving the
  attempted path) rather than merely hiding nav links. `/tutorials` and
  `/tutorials/:id` are intentionally public, matching the backend (no
  auth required on those GETs) — only the interaction buttons on the
  detail page require login, and prompt for it inline if you're not.

---

## 4. Request lifecycle walkthroughs

### Login

```
User submits LoginPage form
  ↓
react-hook-form validates (zod: email format, password non-empty)
  ↓
AuthContext.login({email, password})
  ↓
authApi.login() → apiClient.post('/auth/login', ...)
  ↓
Axios request interceptor (no token yet, none attached)
  ↓
POST /api/auth/login
  ↓
Express → auth.routes.js → validate(loginSchema) → auth.controller.js login()
  ↓
user.repository.js findByEmailWithPassword() → Cypher MATCH → CognoDB
  ↓
bcrypt.compare(password, user.passwordHash)
  ↓
signAccessToken(user.id) → JWT { sub: userId }
  ↓
{success:true, data:{user, token}}
  ↓
Axios response
  ↓
setStoredToken(token) → localStorage
  ↓
AuthContext sets user state
  ↓
LoginPage navigates to /dashboard (or the originally requested route)
```

### Fetch tutorials (discovery page)

```
TutorialsPage mounts / filter changes
  ↓
useTutorials({difficulty, limit, offset})
  ↓
tutorialsApi.getTutorials(params) → apiClient.get('/tutorials', {params})
  ↓
GET /api/tutorials?difficulty=...&limit=...&offset=...
  ↓
Express → tutorial.routes.js → validate(listTutorialsSchema) → listTutorials()
  ↓
tutorial.repository.js list() → Cypher MATCH ... SKIP ... LIMIT → CognoDB
  ↓
{success:true, data:{tutorials, count}}
  ↓
useTutorials sets state → TutorialGrid renders TutorialCards
```

### Like a tutorial

```
User clicks "Like" on TutorialDetailsPage
  ↓
handleLike() (guarded against double-clicks via isLiking state)
  ↓
tutorialsApi.likeTutorial(id) → apiClient.post('/tutorials/:id/like')
  ↓
Axios request interceptor attaches Authorization: Bearer <token>
  ↓
POST /api/tutorials/:id/like
  ↓
Express → tutorial.routes.js → requireAuth (verifies JWT, sets req.user.id)
  ↓
interaction.controller.js like() → interaction.repository.js recordLike()
  ↓
Cypher: MATCH user+tutorial, MERGE (u)-[r:LIKED]->(t) ON CREATE SET r.createdAt
  ↓
CognoDB creates/confirms the LIKED relationship
  ↓
{success:true, data:{interaction:{createdAt}}}
  ↓
Axios response → setHasLiked(true) → button switches to "Liked ✓"
```

### Complete a tutorial

Identical shape to Like, hitting `POST /api/tutorials/:id/complete`,
which `MERGE`s a `COMPLETED` relationship with `progress: 100` and
`completedAt`. The UI shows a note that recommendations will reflect
this the next time they're fetched (see below for why that's true).

### Fetch recommendations (the deep one)

```
DashboardPage mounts
  ↓
useRecommendations(limit)
  ↓
recommendationsApi.getRecommendations(limit)
  ↓
apiClient.get('/recommendations', {params:{limit}})
  ↓
Axios attaches Authorization: Bearer <token>
  ↓
GET /api/recommendations?limit=6
  ↓
Express → recommendation.routes.js → requireAuth → req.user.id
  ↓
recommendation.controller.js getRecommendations(req.user.id, limit)
  ↓
recommendation.repository.js getRecommendations():
    MATCH (u:User {id})
    collect tutorials already VIEWED/LIKED/COMPLETED → excludeIds
    CALL { five UNION ALL branches, each a graph path:
      (u)-[:LIKED]->()-[:ABOUT]->(topic)<-[:ABOUT]-(candidate)         +5
      (u)-[:COMPLETED]->()-[:TEACHES]->(skill)<-[:TEACHES]-(candidate) +4
      (u)-[:LIKED]->()-[:ABOUT]->()-[:RELATED_TO]->()<-[:ABOUT]-(candidate)     +3
      (u)-[:COMPLETED]->()-[:TEACHES]->()-[:RELATED_TO]->()<-[:TEACHES]-(candidate) +2
      (u)-[:VIEWED]->()-[:ABOUT]->(topic)<-[:ABOUT]-(candidate)        +1
    }
    sum(score) per candidate + popularity term (engagementCount * 0.1)
    ORDER BY score DESC LIMIT $limit
  ↓
if zero candidates (new user, no history) → FALLBACK_QUERY:
    most-engaged-then-most-recent tutorials, excluding consumed ones
  ↓
CognoDB executes the traversal + aggregation + ranking inside the graph engine
  ↓
{success:true, data:{recommendations:[{tutorial, score, reasons, engagementCount}], count, usedFallback}}
  ↓
Axios response
  ↓
useRecommendations sets state
  ↓
RecommendationGrid renders RecommendationCards, each showing:
  - tutorial title/description/difficulty/duration
  - ReasonBadge per entry in `reasons` (translated to plain English,
    e.g. "liked_topic_match" → "Because you liked a similar topic")
  - match score (only when not null, i.e. not a fallback result)
  - a one-line fallback explanation banner if usedFallback is true
```

**How prior interactions actually change this result:** if you like
"JavaScript Fundamentals" (`ABOUT → topic-javascript`), and
`topic-javascript` is `RELATED_TO topic-react`, then any tutorial
`ABOUT topic-react` becomes a `related_topic` candidate (+3) the next
time `GET /api/recommendations` runs — no caching layer sits between the
interaction and the next recommendation fetch, so clicking "Refresh" on
the dashboard after liking something will visibly change the results.

---

## 5. Environment configuration

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Point this at wherever the GraphRec backend is actually running,
including its `/api` prefix. This is the only environment variable the
frontend needs — it's a `VITE_*` variable, so remember it's exposed to
the browser bundle; no secrets belong here (and there are none to put
here, since the backend never issues frontend-held secrets beyond the
per-user JWT).

---

## 6. Setup & running

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL
npm run dev                # http://localhost:5173
```

The GraphRec backend must be running and reachable at that URL — this
frontend has no offline/mock mode.

```bash
npm run build      # type-checks (tsc -b) then builds to dist/
npm run preview    # serves the production build locally
```

---

## 7. Routes

| Path | Auth | Page |
|---|---|---|
| `/` | – | `LandingPage` |
| `/login` | – | `LoginPage` |
| `/register` | – | `RegisterPage` |
| `/tutorials` | – | `TutorialsPage` |
| `/tutorials/:id` | – (interactions inline-gate on auth) | `TutorialDetailsPage` |
| `/dashboard` | ✓ | `DashboardPage` |
| `/profile` | ✓ | `ProfilePage` |
| `*` | – | `NotFoundPage` |

---

## 8. Responsive design

Every page is built mobile-first with Tailwind's responsive prefixes
(`sm:`, `lg:`) rather than a single desktop layout that gets shrunk:

- **Navbar** collapses to a hamburger menu with a slide-down panel below
  the `md` breakpoint; desktop shows inline nav + auth buttons.
- **Grids** (tutorials, recommendations) go `grid-cols-1` on mobile →
  `sm:grid-cols-2` → `lg:grid-cols-3`, so cards never feel cramped on a
  phone or oddly sparse on a wide screen.
- **Forms** (login/register) are full-width on mobile, capped at
  `max-w-md` and centered on larger screens.
- **Buttons** in stacked action rows (tutorial detail page) are
  `fullWidth` on mobile and shrink to `sm:w-auto` inline once there's
  room.
- **Typography** scales with breakpoints (`text-2xl sm:text-3xl`, etc.)
  rather than staying fixed-size across all viewports.
- Tested via `npm run build && npm run preview`, then resized manually —
  the SPA fallback and every route return 200 at each breakpoint (see
  §9).

---

## 9. Testing performed

Verified in this environment:

- `tsc -b` — zero type errors across the whole project.
- `npm run build` — production build succeeds (133 modules, no
  bundling errors).
- `npm run preview` + `curl` against `/`, `/tutorials`, `/dashboard` —
  all return 200 (confirms the SPA history fallback and routing config
  work for direct/deep links, not just in-app navigation).

**Not verified in this environment (no live backend/CognoDB reachable
here):** the actual authenticated flows — register → login → view →
like → complete → recommendations — against a running backend. To
complete this yourself:

```bash
# terminal 1 — backend
cd graphrec && npm install && npm run db:migrate && npm run db:seed && npm run dev

# terminal 2 — frontend
cd graphrec-frontend && npm install && npm run dev
```

Then walk through the exact journey requested:

1. Open `/` → confirm the landing page loads sample tutorials.
2. `/register` → create an account → should land on `/dashboard`.
3. `/tutorials` → open a tutorial → confirm a view request fires (check
   the Network tab for `POST /tutorials/:id/view`, 200).
4. Click **Like** → confirm `POST /tutorials/:id/like` → button flips to
   "Liked ✓".
5. Click **Mark complete** → confirm `POST /tutorials/:id/complete`.
6. Open a topically-related tutorial (e.g. if you liked a JavaScript
   tutorial, open the React one) and like it too.
7. Return to `/dashboard`, click **Refresh** under "Recommended for
   you" → confirm new/reordered recommendations appear, each tagged with
   a reason, and `usedFallback` is `false` if you have any interaction
   history.
8. Log out → confirm `/dashboard` and `/profile` redirect to `/login`,
   and `/tutorials`/`/tutorials/:id` remain viewable.
9. Try an expired/garbage token (edit `localStorage.graphrec_token` in
   devtools) → confirm the next authenticated request logs you out
   cleanly rather than showing a broken screen.

---

## 10. Final project structure

```
graphrec-frontend/
├── src/
│   ├── api/
│   │   ├── axios.ts              # client, token storage, error extraction, 401 handling
│   │   ├── auth.api.ts
│   │   ├── users.api.ts
│   │   ├── tutorials.api.ts      # CRUD + view/like/complete (mirrors backend nesting)
│   │   └── recommendations.api.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx          # Card, Spinner, Skeleton, SkeletonGrid, SectionHeading
│   │   │   ├── States.tsx        # EmptyState, ErrorState
│   │   │   └── Input.tsx         # Input, FormError
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx        # Footer, PageContainer
│   │   ├── tutorials/
│   │   │   ├── TutorialCard.tsx
│   │   │   ├── TutorialGrid.tsx
│   │   │   └── TutorialMetadata.tsx  # DifficultyBadge, TopicBadge, SkillBadge, TutorialMetadata
│   │   └── recommendations/
│   │       ├── RecommendationCard.tsx
│   │       ├── RecommendationGrid.tsx
│   │       └── ReasonBadge.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TutorialsPage.tsx
│   │   ├── TutorialDetailsPage.tsx   # also the "learning experience" (see rationale in file)
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTutorials.ts
│   │   └── useRecommendations.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── tutorial.ts
│   │   └── recommendation.ts
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   ├── utils/
│   │   └── formatters.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── index.html
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

**Deviation from the originally proposed structure:** no separate
`LearningPage.tsx` and no `interactions.api.ts` / `components/auth/` —
see the rationale comments in `TutorialDetailsPage.tsx` and
`tutorials.api.ts` respectively. Both mirror structural decisions
already made on the backend for the same underlying reason (the backend
doesn't separate these concerns either).
