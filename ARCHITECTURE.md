# Architektura — Krejčí App

## Přehled

Aplikace je **Next.js 14 monorepo** postavený na App Routeru. Frontend i backend API žijí v jednom projektu — API routes (`src/app/api/`) tvoří REST backend, React komponenty tvoří frontend.

```
Browser → Next.js Server → API Routes → Prisma → PostgreSQL
                        ↓
                   React Components (SSR/CSR)
```

---

## Vrstvy aplikace

### 1. Presentační vrstva (`src/app/`, `src/components/`)

- **App Router** — každá složka = route segment
- **Route Groups** `(auth)`, `(customer)`, `(admin)` — logické seskupení bez vlivu na URL
- **Server Components** — výchozí; data fetching přímo na serveru
- **Client Components** — označeny `"use client"`, pouze tam kde je nutná interaktivita

### 2. API vrstva (`src/app/api/`)

- REST API routes (Next.js Route Handlers)
- Autentizace přes NextAuth session (middleware kontroluje přístup)
- Validace vstupů — Zod

```
GET  /api/orders          → seznam objednávek
POST /api/orders          → vytvoření objednávky
GET  /api/orders/[id]     → detail objednávky
PUT  /api/orders/[id]     → aktualizace stavu

GET  /api/tailors         → seznam krejčích
GET  /api/tailors/match   → matching krejčí dle lokality + specializace
```

### 3. Datová vrstva (`src/lib/prisma.ts`, `prisma/schema.prisma`)

- **Prisma ORM** — type-safe přístup k PostgreSQL
- Singleton pattern pro Prisma klienta (důležité v Next.js dev módu)
- Migrace verzovány v `prisma/migrations/`

---

## DB Schéma

```
User
├── id (uuid)
├── email (unique)
├── name
├── passwordHash
├── role: CUSTOMER | TAILOR | ADMIN
├── createdAt
└── updatedAt

TailorProfile        ← 1:1 s User (role TAILOR)
├── id
├── userId
├── bio
├── locality
├── specializations: ServiceType[]
├── isAvailable
└── rating

Order
├── id
├── customerId → User
├── tailorId → TailorProfile (nullable, přiřazeno matchingem)
├── serviceType: ALTERATION | CUSTOM_SEWING | EXPRESS
├── description
├── address
├── scheduledAt
├── status: PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED
├── price (nullable)
├── createdAt
└── updatedAt
```

### Vztahy

```
User (CUSTOMER) ──< Order >── TailorProfile ──── User (TAILOR)
```

---

## Autentizace

- **NextAuth.js** s `CredentialsProvider` (email + heslo)
- Hesla hashována přes **bcryptjs** (cost factor 12)
- Session uložena v **HTTP-only cookie** (JWT strategy)
- Middleware (`src/middleware.ts`) chrání routes dle role

```
/dashboard/*   → CUSTOMER, TAILOR, ADMIN
/admin/*       → pouze ADMIN
/api/*         → dle endpointu
```

---

## Matching systém (plán)

Jednoduchý algoritmus v `src/lib/matching.ts`:

1. Filtr krejčích dle `locality` (shoda s adresou objednávky)
2. Filtr dle `serviceType` (krejčí musí mít specializaci)
3. Seřazení dle `rating` DESC + `isAvailable`
4. Přiřazení prvního dostupného krejčího

---

## Styling

- **SCSS Modules** — každá komponenta má vlastní `.module.scss`
- Globální proměnné v `src/styles/variables.scss` (barvy, fonty, breakpointy)
- Mixiny pro responzivitu v `src/styles/mixins.scss`
- Globální reset + základní styly v `src/styles/globals.scss`

### Design systém

```
Barvy:
  --color-primary:    #1a1a2e    (tmavě modrá — luxus)
  --color-accent:     #c9a84c    (zlatá — prémium)
  --color-surface:    #f8f6f1    (krémová — warm)
  --color-text:       #2d2d2d
  --color-text-muted: #7a7a7a

Typografie:
  Display: Playfair Display (serif)
  Body:    DM Sans (sans-serif)
```

---

## Adresářová struktura (detail)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── login.module.scss
│   │   └── register/
│   │       ├── page.tsx
│   │       └── register.module.scss
│   ├── (customer)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── orders/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── orders/page.tsx
│   │       └── tailors/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts           (GET list, POST create)
│   │   │   └── [id]/route.ts      (GET, PUT, DELETE)
│   │   └── tailors/
│   │       ├── route.ts
│   │       └── match/route.ts
│   ├── layout.tsx                 (root layout)
│   ├── page.tsx                   (landing page)
│   └── globals.scss               (importuje src/styles/globals.scss)
│
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.module.scss
│   │   ├── Input/
│   │   ├── Card/
│   │   └── Badge/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Nav/
│   └── features/
│       ├── OrderForm/
│       ├── TailorCard/
│       ├── ServicePicker/
│       └── BookingCalendar/
│
├── lib/
│   ├── prisma.ts                  (singleton Prisma client)
│   ├── auth.ts                    (NextAuth config)
│   ├── matching.ts                (matching algoritmus)
│   ├── validations.ts             (Zod schémata)
│   └── utils.ts                   (helpers)
│
├── styles/
│   ├── globals.scss
│   ├── variables.scss
│   └── mixins.scss
│
└── types/
    └── index.ts                   (sdílené TS typy)
```

---

## Konvence

- Komponenty: **PascalCase** složky s `index.tsx` nebo `ComponentName.tsx`
- API handlers: pojmenované exporty `GET`, `POST`, `PUT`, `DELETE`
- Typy: prefix `T` pro typy, `I` se nepoužívá (Prisma generuje vlastní)
- Error handling: try/catch v API routes, `NextResponse.json({ error })` s HTTP kódem
- Environment: `.env.local` (nikdy commitovat), vzor v `.env.example`
