# POS Boilerplate

An open-source frontend POS (Point of Sale) boilerplate built with Next.js 15+, React 19, and TailwindCSS 4. Ships with a localStorage backend out of the box — connect it to any REST API by setting a single environment variable.

> UI design system based on [TailAdmin](https://tailadmin.com/) free Next.js dashboard.

## Features

### Cashier (POS)
- **Product catalog** — search, category filter, barcode scanner (hardware + manual entry)
- **Cart management** — add/remove lines, numpad editing (qty / discount / price), live totals
- **Hold & Recall** — park the current order, start a new one, recall or discard held orders
- **Customer selection** — search existing customers or create a new one on the fly
- **Loyalty points** — earn points on every purchase, redeem as payment
- **Order discount** — apply a percentage discount to the whole order
- **Split payment** — multiple payment methods on a single order (cash, card, e-wallet, points)
- **Receipt screen** — full itemised receipt with tax, discount, change, and print support

### Session Management
- **Open / Resume** session with optional opening cash float
- **Z-Report** — end-of-day report with payment breakdown, order list, and cash reconciliation (expected vs. actual drawer count)

### Admin Backoffice
- **Full CRUD** — Products, Categories, UOM, Warehouses, Contacts, Users, Payment Methods, Shops
- **Orders** — view order details (lines + payments); process refunds with automatic stock restoration
- **Dashboard** — 7-day revenue chart, top products, recent orders, key stats
- **Sales report** — filterable by today / this week / this month / all time
- **Sessions** — view all session history

### Platform
- **Pluggable backend** — swap `localStorage` for any REST API via `NEXT_PUBLIC_BACKEND_ADAPTER=api`
- **Role-based access** — Admin, Manager, Cashier with guarded routes
- **Dark mode** — full light/dark theme support
- **Responsive** — desktop side-by-side layout; mobile tab-based layout
- **Zero external state library** — pure `useReducer` + React Context

## Quick Start

```bash
git clone https://github.com/dimastriann/pos-with-nextjs.git
cd pos-with-nextjs
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in as `cashier` / `cashier` to try the POS, or `admin` / `admin` for the backoffice.

## Demo Credentials

| Role    | Username  | Password  | Access                          |
|---------|-----------|-----------|----------------------------------|
| Admin   | `admin`   | `admin`   | Full backoffice + all reports    |
| Manager | `manager` | `manager` | Shop & report views              |
| Cashier | `cashier` | `cashier` | POS cashier screen               |

Seeded automatically into localStorage on first run. Clear browser storage to reseed fresh demo data.

## Architecture

```
Browser
  │
  ├── Next.js App Router (src/app/)
  │     ├── /login            → adapter.login()
  │     ├── /admin/*          → CRUD via repositories
  │     ├── /pos              → POSProvider → posReducer state machine
  │     │     ├── /session    → open / resume session + opening float
  │     │     ├── /report     → sales report with date filter
  │     │     └── /zreport    → end-of-day Z-report + cash reconciliation
  │     └── /manager/*        → shop overview
  │
  ├── POS State Machine (posReducer + POSContext)
  │     pos_order → payment → receipt → pos_order
  │     + heldOrders[] for parked carts
  │
  ├── Repository Layer  (src/repositories/)
  │     productRepository, orderRepository, sessionRepository …
  │     └── validated with Zod schemas on every write
  │
  └── Adapter Layer  (src/adapters/)
        IBackendAdapter interface
          ├── LocalStorageAdapter  ← default (offline, seeds demo data)
          └── ApiAdapter           ← REST skeleton (set NEXT_PUBLIC_BACKEND_ADAPTER=api)
```

## Connecting a Real Backend

1. Copy `.env.local.example` to `.env.local` and set:
   ```env
   NEXT_PUBLIC_BACKEND_ADAPTER=api
   NEXT_PUBLIC_API_URL=https://your-api.example.com/api
   ```
2. The `ApiAdapter` expects standard REST endpoints:
   - `GET    /{resource}`      → array
   - `GET    /{resource}/:id`  → single item or 404
   - `POST   /{resource}`      → creates, returns item with `id`
   - `PUT    /{resource}/:id`  → updates, returns item
   - `DELETE /{resource}/:id`  → 204 no content
   - `POST   /auth/login`      → `{ username, password }` → `{ token, user }`
   - `GET    /auth/me`         → `{ ...user }` (requires `Authorization: Bearer <token>`)
3. Resource names are defined in `src/adapters/resourceKeys.ts`.

For custom adapters (GraphQL, Supabase, Firebase, etc.) see [CLAUDE.md](./CLAUDE.md).

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 15+ App Router            |
| UI         | React 19, TailwindCSS 4           |
| Components | shadcn/ui, Lucide icons           |
| Language   | TypeScript 5.7 (strict)           |
| Validation | Zod 4                             |
| State      | `useReducer` + React Context      |
| Testing    | Jest 30, `@testing-library/react` |
| Animations | Motion (Framer Motion v12)        |

## Running Tests

```bash
npm test              # run all tests
npm test -- --watch   # watch mode
```

## Contributing

See [CLAUDE.md](./CLAUDE.md) for the full architecture guide — how to add a new adapter, admin page, or reducer action.

## License

MIT
