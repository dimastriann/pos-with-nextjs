# POS Boilerplate — Architecture Guide

## Overview

A frontend-only POS (Point of Sale) boilerplate built with Next.js 15+ App Router, React 19, TypeScript, and TailwindCSS 4. The backend is pluggable via an adapter pattern — ships with localStorage by default, swappable to any REST API via a single env var.

## Key Environment Variables

```env
NEXT_PUBLIC_BACKEND_ADAPTER=localStorage   # or "api"
NEXT_PUBLIC_API_URL=http://localhost:8080/api  # used when adapter=api
```

Copy `.env.local.example` to `.env.local` to get started.

## Architecture

```
src/
├── adapters/              # Backend adapter layer
│   ├── IBackendAdapter.ts    # Interface all adapters must implement
│   ├── resourceKeys.ts       # Central string constants for resource names
│   ├── index.ts              # Factory: selects adapter from env var
│   ├── local/
│   │   └── LocalStorageAdapter.ts   # Default — seeds demo data on first run
│   └── api/
│       └── ApiAdapter.ts    # REST skeleton — plug in your backend URL
│
├── repositories/          # Thin modules over the adapter + Zod validation
│   ├── productRepository.ts
│   ├── orderRepository.ts   # includes createWithLines()
│   ├── sessionRepository.ts # includes getOpenSessionForShop(), incrementTotals()
│   └── ...                  # one file per domain entity
│
├── models/                # TypeScript interfaces (the source of truth)
│   ├── Product.ts
│   ├── MasterData.ts        # Category, Uom, Contact, PaymentMethod, Warehouse
│   ├── PosModels.ts         # PosShop, PosSession, PosOrderLine, PosPayment, PosOrder
│   └── User.ts
│
├── schemas/               # Zod schemas — validated on repository writes only
│
├── lib/
│   ├── context/
│   │   ├── posReducer.ts    # Pure reducer + initialPOSState
│   │   ├── posThunks.ts     # Async actions (processPayment)
│   │   └── POSContextStore.tsx  # Provider + usePOS() hook
│   └── utils/
│       ├── cartCalculations.ts  # computeSubtotal, computeCartTotal, computeChange
│       └── generateId.ts        # crypto.randomUUID() with fallback
│
├── components/pos/        # Cashier UI components
│   ├── PosOrderScreen.tsx   # Product grid + cart list
│   ├── Numpad.tsx           # Mode selector + digit grid
│   ├── PaymentScreen.tsx    # Payment method selector + totals
│   └── ReceiptScreen.tsx    # Order summary + print
│
├── app/
│   ├── login/               # Login page — uses adapter.login()
│   ├── admin/               # Backoffice pages (CRUD for every entity)
│   ├── pos/
│   │   ├── layout.tsx       # Auth guard + POSProvider wrapper
│   │   ├── page.tsx         # Screen router (pos_order / payment / receipt)
│   │   ├── session/         # Session gate — open or resume session
│   │   └── report/          # Sales report with date range filter
│   └── manager/             # Manager dashboard
│
└── types/
    └── POSContext.ts        # POSState, POSAction, NumpadMode, POSScreen
```

## POS State Machine

The cashier flow is managed by `posReducer` — not Next.js routing. `state.currentScreen` controls which component renders inside `/pos`:

```
pos_order  →  payment  →  receipt  →  pos_order (new order)
           ←  GOTO_ORDER
```

Key state fields:
- `cartLines: CartLine[]` — items in the current order
- `selectedLineIndex: number | null` — which line the numpad edits
- `numpadMode: 'qty' | 'disc' | 'price'` — what field the numpad controls
- `numpadInput: string` — current digit buffer, committed live on each keypress
- `paymentLines: ActivePayment[]` — payment split for the current order
- `activeSession / activeShop` — set by `SESSION_START` action

## How to Add a New Backend Adapter

1. Create `src/adapters/my-backend/MyAdapter.ts` implementing `IBackendAdapter`:

```typescript
import { IBackendAdapter, AuthResult } from '@/adapters/IBackendAdapter';
import { User } from '@/models/User';

export class MyAdapter implements IBackendAdapter {
  async getAll<T>(resource: string): Promise<T[]> { /* ... */ }
  async getById<T>(resource: string, id: string): Promise<T | null> { /* ... */ }
  async create<T extends { id: string }>(resource: string, item: T): Promise<T> { /* ... */ }
  async update<T extends { id: string }>(resource: string, item: T): Promise<T> { /* ... */ }
  async delete(resource: string, id: string): Promise<void> { /* ... */ }
  async login(username: string, password: string): Promise<AuthResult> { /* ... */ }
  async logout(): Promise<void> { /* ... */ }
  async getCurrentUser(): Promise<User | null> { /* ... */ }
}
```

2. Register it in `src/adapters/index.ts`:

```typescript
import { MyAdapter } from './my-backend/MyAdapter';
// ...
export const adapter: IBackendAdapter =
  backendType === 'api' ? new ApiAdapter(apiUrl)
  : backendType === 'my-backend' ? new MyAdapter()
  : new LocalStorageAdapter();
```

3. Set `NEXT_PUBLIC_BACKEND_ADAPTER=my-backend` in `.env.local`.

## How to Add a New Admin Page

1. Create `src/app/admin/my-resource/page.tsx` following the pattern in any existing admin page:
   - `'use client'`
   - `useEffect` calls the relevant repository `.getAll()`
   - handlers call `.create()` / `.update()` / `.delete()`
   - `isLoading` state guards the submit button

2. Add the resource string to `src/adapters/resourceKeys.ts`.

3. Add a repository in `src/repositories/myResourceRepository.ts` following the same thin-wrapper pattern.

4. Add a Zod schema in `src/schemas/myResource.schema.ts` for write validation.

5. Optionally seed demo data in `LocalStorageAdapter.ts` in the `seedIfEmpty()` method.

## How to Add a New Reducer Action

1. Add the action shape to the `POSAction` union in `src/types/POSContext.ts`:
   ```typescript
   | { type: 'MY_ACTION'; payload: string }
   ```

2. Handle it in `posReducer` in `src/lib/context/posReducer.ts`:
   ```typescript
   case 'MY_ACTION':
     return { ...state, someField: action.payload };
   ```

3. Dispatch it from a component via `const { dispatch } = usePOS()`.

4. If the action requires async work (API calls, repository writes), add a thunk in `src/lib/context/posThunks.ts` instead.

## Running Tests

```bash
npm test                  # run all tests
npm test -- --watch       # watch mode
npm test -- --coverage    # with coverage report
```

Test files live in `src/__tests__/`. The `MockAdapter` in `src/__tests__/mocks/MockAdapter.ts` is an in-memory `IBackendAdapter` for use in tests that need repository-level logic without touching localStorage.

## Demo Credentials

| Role    | Username  | Password  |
|---------|-----------|-----------|
| Admin   | `admin`   | `admin`   |
| Manager | `manager` | `manager` |
| Cashier | `cashier` | `cashier` |

Seeded by `LocalStorageAdapter` on first load. Clear localStorage to reseed.
