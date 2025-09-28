## Flywheel — World Mini App (Hackathon Spec)

### 1) One‑liner
Delegate on‑chain actions to skilled resolvers to earn automated rewards from World Chain mini apps (e.g., Morpho leveraged positions), with trust minimized via World ID, pay, and auditable references.

### 2) Problem & Motivation
- Many users lack the time/skill to actively farm or manage positions in mini apps (surveys, games, lending, leverage).
- They still want outcomes: leveraged position management, reward farming, or managed exposure.
- Resolvers can do the work and collect commission; activity increases on World Chain.

### 3) Core Concept
- Requesters post “Action Requests” describing tasks and incentives (e.g., open/maintain a leveraged position on Morpho, auto‑rebalance weekly, commission 10%).
- Resolvers accept requests, execute through relevant mini apps, and claim commission on realized profit.
- Payment and proof flows use MiniKit (pay, verify) and reference IDs for auditability.

### 4) Scope (Hackathon Demo: Morpho Flow — Simplified v2)
- Focus: Leveraged position management via Morpho World Mini App.
- Contracts-backed: ActionManagerFactory/ActionManager drive lifecycle; backend signature removed.
- End‑to‑end UX: create request → accept → verify identity → execute → settle(returnAmount).

### 5) Primary Personas
- Requester: supplies capital or sets a bounty to obtain outcomes.
- Resolver: executes strategy using mini apps; earns commission or fixed fee.

### 6) High‑Level Flows
- Identity: gate critical actions with `verify` (Device by default; Orb optional).
- Payments: use `pay` with `reference` to tie UI actions to on‑chain transfers; server stores reference for reconciliation.
- Escrow (Phase 2, contract): hold requester funds, release on completion → resolver commission + requester remainder.
- Auditability: every action binds to a `reference` and is persisted; results viewable in dashboards.

### 7) Pages & Navigation
- Requests: public feed of open action requests, filters, details, accept CTA.
- Requester Dashboard: list of my requests, statuses, PnL, settle/withdraw.
- Resolver Dashboard: accepted requests, execution steps, claim commission.

#### 7.1) Routing & Files (Next.js App Router)
- `src/app/page.tsx`: Entry; sign‑in and auth gate. Already present.
- `src/app/(protected)/home/page.tsx`: Overview after sign‑in; links to key areas. Already present.
- `src/app/(protected)/requests/page.tsx`: Feed of open requests (search/filter/sort). CTA: View details, Accept.
- `src/app/(protected)/requests/[id]/page.tsx`: Single request detail, parameters, budget, commission, audit log, Accept/Start.
- `src/app/(protected)/requester/page.tsx`: My requests; Create Request; statuses (Open, Assigned, Executing, Settled), PnL, settle/withdraw.
- `src/app/(protected)/resolver/page.tsx`: My assignments; execution checklist; commission claim; verification status.

Component sketches (client components using MiniKit + UI Kit):
- `RequestsList`, `RequestCard`, `RequestDetail`, `CreateRequestForm`
- `AssignmentsList`, `AssignmentDetail`, `ExecutionTimeline`
- `SettlementPanel`, `PnLStatGroup`, `FiltersBar`

Access control:
- All `(protected)` routes require session via `auth()`.
- Actions that mutate state require verified users (Device min), checked server‑side.

Empty/edge states:
- No open requests → helper text + CTA to Create (for requesters).
- Resolver without assignments → discovery guidance linking to Requests feed.

### 8) Data Model (Initial, off‑chain)
- User: { id, worldIdHash, username, walletAddress, role[requester|resolver] }
- Request: { id, ownerId, title, description, strategy:"Morpho: vault/market", 
  params, budgetToken, budgetAmount, commissionBps, status, createdAt }
- Assignment: { id, requestId, resolverId, acceptedAt, status }
- ExecutionLog: { id, requestId, reference, type, payload, txHash?, timestamp }
- Settlement: { id, requestId, grossProfit, commissionAmount, requesterAmount, 
  reference, txHash?, settledAt }

### 9) API Contracts (Server Routes)
- POST /api/requests: create request (requires verified user)
  - body: { title, description, strategy, params, budgetToken, budgetAmount, commissionBps }
  - returns: { request }
- POST /api/requests/:id/accept: resolver accepts
  - returns: { assignment }
- POST /api/requests/:id/execute: log step and get `pay` reference
  - returns: { id: reference }
- POST /api/requests/:id/settle: compute PnL, produce payouts
  - returns: { settlement }
- POST /api/verify-proof: server‑side verification
- POST /api/initiate-payment: returns UUID reference
- Contracts routes: see `docs/backend-api-spec.md`

Note: For hackathon, persist in memory or a lightweight KV; production → DB.

### 10) MiniKit Integrations (Simplified)
- Verify: require `VerificationLevel.Device` at minimum before create/accept.
- Send Transaction: use `commandsAsync.sendTransaction` to call factory/manager directly.

### 11) Morpho Demo Flow (Happy Path, v2)
1) Requester verifies → creates Morpho request (budget 100 USDCe, 10% commission).
2) Resolver verifies → accepts request with Pyth update bytes; pays oracle fee.
3) Resolver executes: opens/adjusts leveraged Morpho position; logs `execute` step reference.
4) Settlement: resolver computes `returnAmount` and calls `ActionManager.settle(returnAmount)` directly.

### 12) Security & Trust Model
- World ID proof checked server‑side (`/api/verify-proof`).
- All critical state changes require a verified session.
- Payments are always initiated by client but bound to server‑issued `reference`.
- Phase 2 smart contracts add non‑custodial escrow and programmable payouts.

### 13) Metrics
- Number of requests created/accepted/executed/settled.
- Total volume, realized PnL, commissions paid.
- Verification conversion and drop‑offs.

### 14) Milestones
- M1: Spec + skeleton pages (Requests feed, Requester, Resolver) wired to server mocks.
- M2: World ID gating and payment reference logging.
- M3: Morpho demo flow with simulated PnL and settlement.
- M4: Optional: basic charts on dashboards.

### 15) Risks & Mitigations
- Data integrity without contracts → mitigate by strict server references and logs.
- Resolver misbehavior → phase 2 with escrow contracts and slashing/ratings.
- Oracle/price assumptions for PnL → keep simulated and transparent for demo.

### 16) Future Work
- Escrow contract; automated flows; resolver reputation; policy guardrails; circuit breakers.


