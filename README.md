# POS Boilerplate

An open-source frontend POS (Point of Sale) boilerplate built with Next.js, React 19, and TailwindCSS. Ships with a localStorage backend out of the box — connect it to any REST API by setting a single environment variable.

## Features

- **Cashier flow** — product search, cart management, numpad (qty / discount / price), payment split, receipt screen
- **Session management** — open/resume cash register session, session close with totals
- **Backoffice admin** — CRUD for Products, Categories, Users, Contacts, Payment Methods, UOM, Warehouses, Shops
- **Sales report** — filterable by today / this week / this month / all time
- **Pluggable backend** — swap `localStorage` for any REST API via `NEXT_PUBLIC_BACKEND_ADAPTER=api`
- **Role-based access** — Admin, Manager, Cashier with guarded routes
- **Zero external state library** — pure `useReducer` + React Context

## Quick Start

```bash
git clone https://github.com/dimastriann/pos-with-nextjs.git
cd pos-with-nextjs
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in as `cashier` / `cashier` to try the POS flow, or `admin` / `admin` to manage data.

## Login Credentials (demo)

| Role    | Username  | Password  | Access                      |
|---------|-----------|-----------|------------------------------|
| Admin   | `admin`   | `admin`   | Full backoffice              |
| Manager | `manager` | `manager` | Shop & report views          |
| Cashier | `cashier` | `cashier` | POS cashier screen           |

Credentials are seeded automatically into localStorage on first run. Clear browser storage to reseed fresh demo data.

## Architecture

```
Browser
  │
  ├── Next.js App Router (src/app/)
  │     ├── /login          → adapter.login()
  │     ├── /admin/*        → CRUD via repositories
  │     ├── /pos            → POSProvider → posReducer state machine
  │     │     ├── /session  → open / resume cash register session
  │     │     └── /report   → sales report with date filter
  │     └── /manager/*      → shop overview
  │
  ├── POS State Machine (posReducer + POSContext)
  │     pos_order → payment → receipt → pos_order
  │
  ├── Repository Layer  (src/repositories/)
  │     productRepository, orderRepository, sessionRepository …
  │     └── validates writes with Zod schemas
  │
  └── Adapter Layer  (src/adapters/)
        IBackendAdapter interface
          ├── LocalStorageAdapter  ← default (works offline, seeds demo data)
          └── ApiAdapter           ← REST skeleton (set NEXT_PUBLIC_BACKEND_ADAPTER=api)
```

## Connecting a Real Backend

1. Copy `.env.local.example` to `.env.local`.
2. Set:
   ```env
   NEXT_PUBLIC_BACKEND_ADAPTER=api
   NEXT_PUBLIC_API_URL=https://your-api.example.com/api
   ```
3. The `ApiAdapter` expects these REST endpoints:
   - `GET    /{resource}`        → returns array
   - `GET    /{resource}/:id`    → returns single item or 404
   - `POST   /{resource}`        → creates, returns item with `id`
   - `PUT    /{resource}/:id`    → updates, returns item
   - `DELETE /{resource}/:id`    → 204 no content
   - `POST   /auth/login`        → `{ username, password }` → `{ token, user }`
   - `GET    /auth/me`           → `{ ...user }` (requires `Authorization: Bearer <token>`)
4. Resource names map to `RESOURCE_KEYS` in `src/adapters/resourceKeys.ts`.

To implement a custom adapter (GraphQL, Supabase, Firebase, etc.), see the [CLAUDE.md](./CLAUDE.md) contributor guide.

## Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Framework   | Next.js 15+ App Router               |
| UI          | React 19, TailwindCSS 4              |
| Language    | TypeScript 5.7 (strict)              |
| Validation  | Zod 4                                |
| State       | `useReducer` + React Context         |
| Testing     | Jest 30, `@testing-library/react`    |
| Formatting  | Prettier                             |

## Contributing

See [CLAUDE.md](./CLAUDE.md) for the full architecture guide, including how to add a new adapter, admin page, or reducer action.

## License

MIT
