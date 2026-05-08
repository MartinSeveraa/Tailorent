# Dokument softwarového návrhu (SDD)
## Tailorent — Platforma pro krejčovské služby na vyžádání

**Verze:** 1.0  
**Datum:** 25. dubna 2026  
**Autor:** Martin Severa  
**Status:** Finální

---

## Obsah

1. [Úvod](#1-úvod)
2. [Systémová architektura](#2-systémová-architektura)
3. [Návrh databáze](#3-návrh-databáze)
4. [Návrh API](#4-návrh-api)
5. [Návrh komponent frontend](#5-návrh-komponent-frontend)
6. [Bezpečnostní návrh](#6-bezpečnostní-návrh)
7. [Nasazení a konfigurace](#7-nasazení-a-konfigurace)

---

## 1. Úvod

### 1.1 Účel dokumentu

Tento dokument popisuje softwarový návrh systému Tailorent. Navazuje na SRS (Specifikaci softwarových požadavků) a definuje, jak jsou požadavky implementovány — architektonické rozhodnutí, strukturu databáze, API návrh a organizaci frontend komponent.

### 1.2 Rozsah

Dokument pokrývá celý systém: backend (Next.js API Routes, Prisma ORM, PostgreSQL), frontend (React Server/Client Components, SCSS Modules) a průřezové aspekty (autentizace, validace, bezpečnost).

### 1.3 Definice

| Termín | Vysvětlení |
|--------|-----------|
| App Router | Nový systém routování Next.js 13+ využívající složkovou strukturu v `app/` |
| Server Component | React komponenta renderovaná na serveru, nemá přístup k Browser API |
| Client Component | React komponenta s direktivou `'use client'`, běží v prohlížeči |
| Route Group | Složka v App Routeru s kulatými závorkami — nesundávané z URL, jen pro organizaci |
| Prisma Client | Typově bezpečný databázový klient generovaný ze schema.prisma |
| JWT | JSON Web Token — podepsaný token pro přenos autentizačních dat |
| Middleware | Kód spuštěný před zpracováním každého požadavku |
| SCSS Module | CSS soubor se scoped selektory generovanými Next.js compilátorem |

---

## 2. Systémová architektura

### 2.1 Architektonický přístup

Tailorent využívá **monolitickou serverless architekturu** postavenou na frameworku Next.js. Tento přístup byl zvolen z následujících důvodů:

- **Jednoduchost nasazení** — jeden process pokrývá frontend i backend
- **Sdílené typy** — TypeScript typy a Zod schémata jsou sdílena mezi UI a API
- **Výkon** — Server Components eliminují zbytečné client-server round-tripy
- **Rychlost vývoje** — jeden vývojář nebo malý tým zvládne celý stack

### 2.2 Vrstvová architektura

```
┌─────────────────────────────────────────────────────┐
│                  KLIENTSKÁ VRSTVA                   │
│  Webový prohlížeč (HTML, CSS, JavaScript)           │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────┐
│               APLIKAČNÍ VRSTVA (Next.js)            │
│                                                     │
│  ┌──────────────────┐    ┌───────────────────────┐  │
│  │  Middleware       │    │  Next.js Stránky      │ │
│  │  (Autentizace,    │    │  (Server + Client     │ │
│  │   Autorizace)     │    │   Components)         │ │
│  └──────────────────┘    └───────────────────────┘  │
│                                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │              API Route Handlers                │ │
│  │  /api/auth/register  /api/auth/[...nextauth]   │ │
│  │  /api/orders         /api/orders/[id]          │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │          Aplikační knihovny (src/lib/)        │  │
│  │  auth.ts  prisma.ts  validations.ts  utils.ts │  │
│  └──────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │ TCP/5432
┌─────────────────────▼───────────────────────────────┐
│               DATOVÁ VRSTVA                         │
│  PostgreSQL — Persistentní uložiště dat             │
│  (User, TailorProfile, Order, Enums)                │
└─────────────────────────────────────────────────────┘
```

### 2.3 Adresářová struktura projektu

```
Tailorent/
├── prisma/
│   ├── schema.prisma           # Definice datového modelu
│   ├── seed.ts                 # Seed script (testovací data)
│   └── migrations/             # Verzované databázové migrace
│
├── public/
│   └── images/                 # Statické obrázky (hero, atd.)
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Serverové API endpointy
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   └── orders/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── (auth)/             # Route Group pro auth stránky
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (customer)/         # Route Group pro zákaznické stránky
│   │   │   ├── dashboard/
│   │   │   └── orders/
│   │   ├── (admin)/            # Route Group pro admin stránky
│   │   │   └── admin/
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Hlavní stránka (/)
│   │
│   ├── components/
│   │   ├── ui/                 # Znovupoužitelné UI prvky
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── Badge/
│   │   ├── layout/             # Layoutové komponenty
│   │   │   ├── Header/
│   │   │   └── Footer/
│   │   ├── features/           # Doménové komponenty
│   │   │   ├── OrderForm/
│   │   │   ├── TailorCard/
│   │   │   ├── ServicePicker/
│   │   │   └── BookingCalendar/
│   │   └── providers/
│   │       └── Providers.tsx   # React context providers
│   │
│   ├── lib/
│   │   ├── auth.ts             # NextAuth konfigurace
│   │   ├── prisma.ts           # Prisma singleton
│   │   ├── validations.ts      # Zod schémata
│   │   ├── matching.ts         # Algoritmus párování krejčích
│   │   └── utils.ts            # Pomocné funkce
│   │
│   ├── styles/
│   │   ├── globals.scss        # Globální styly
│   │   ├── variables.scss      # Design tokeny
│   │   └── mixins.scss         # SCSS mixiny (media queries)
│   │
│   ├── types/
│   │   └── index.ts            # Sdílené TypeScript typy
│   │
│   └── middleware.ts           # Next.js Middleware (ochrana tras)
│
├── .env.example                # Šablona proměnných prostředí
├── next.config.ts              # Konfigurace Next.js
├── package.json
└── tsconfig.json
```

### 2.4 Tok dat při vytváření objednávky

```
Zákazník vyplní formulář
        │
        ▼
[Client Component: OrderForm]
 Validace na straně klienta (základní)
        │
        ▼ POST /api/orders
[API Route: src/app/api/orders/route.ts]
 1. getServerSession() → ověř autentizaci
 2. Zod: createOrderSchema.parse(body) → validace
 3. prisma.order.create({ ... }) → zápis do DB
 4. return NextResponse.json(order, { status: 201 })
        │
        ▼
[PostgreSQL]
 INSERT INTO "Order" (customerId, serviceType, ...)
        │
        ▼
[Client Component]
 Přesměrování na /dashboard
```

---

## 3. Návrh databáze

### 3.1 Entitně-relační diagram

```
┌─────────────────┐         ┌──────────────────────┐
│      User       │         │    TailorProfile      │
├─────────────────┤         ├──────────────────────┤
│ id (PK, UUID)   │──1:1───▶│ id (PK, UUID)        │
│ email (UNIQUE)  │         │ userId (FK→User)      │
│ name            │         │ bio                   │
│ passwordHash    │         │ locality              │
│ role (enum)     │         │ specializations[]     │
│ createdAt       │         │ isAvailable           │
│ updatedAt       │         │ rating                │
└────────┬────────┘         │ reviewCount           │
         │                  │ createdAt, updatedAt  │
         │                  └──────────┬────────────┘
         │                             │
         │1:N                          │1:N
         │                             │
         ▼                             ▼
┌──────────────────────────────────────────────────┐
│                      Order                        │
├──────────────────────────────────────────────────┤
│ id (PK, UUID)                                    │
│ customerId (FK→User, RESTRICT on delete)         │
│ tailorId   (FK→TailorProfile, SET NULL on delete)│
│ serviceType (enum: ALTERATION/CUSTOM_SEWING/EXPRESS)│
│ description (nullable)                           │
│ address                                          │
│ city                                             │
│ scheduledAt                                      │
│ status (enum: PENDING/CONFIRMED/IN_PROGRESS/     │
│               COMPLETED/CANCELLED)               │
│ price (Decimal 10,2, nullable)                   │
│ notes (nullable, interní)                        │
│ createdAt, updatedAt                             │
└──────────────────────────────────────────────────┘
```

### 3.2 Datové typy a omezení

#### Tabulka `User`

| Sloupec | Typ | Omezení | Poznámka |
|---------|-----|---------|---------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primární klíč |
| email | VARCHAR | UNIQUE, NOT NULL | Přihlašovací identifikátor |
| name | VARCHAR | NOT NULL | Zobrazované jméno |
| passwordHash | VARCHAR | NOT NULL | bcryptjs hash |
| role | ENUM | NOT NULL, DEFAULT 'CUSTOMER' | CUSTOMER/TAILOR/ADMIN |
| createdAt | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updatedAt | TIMESTAMPTZ | NOT NULL | Auto-update |

#### Tabulka `TailorProfile`

| Sloupec | Typ | Omezení | Poznámka |
|---------|-----|---------|---------|
| id | UUID | PK, NOT NULL | |
| userId | UUID | FK→User, UNIQUE, CASCADE | 1:1 s User |
| bio | TEXT | nullable | |
| locality | VARCHAR | NOT NULL | Město/region |
| specializations | ENUM[] | NOT NULL | Pole ServiceType |
| isAvailable | BOOLEAN | NOT NULL, DEFAULT true | |
| rating | FLOAT | NOT NULL, DEFAULT 0 | 0.0–5.0 |
| reviewCount | INTEGER | NOT NULL, DEFAULT 0 | |
| createdAt | TIMESTAMPTZ | NOT NULL | |
| updatedAt | TIMESTAMPTZ | NOT NULL | |

#### Tabulka `Order`

| Sloupec | Typ | Omezení | Poznámka |
|---------|-----|---------|---------|
| id | UUID | PK, NOT NULL | |
| customerId | UUID | FK→User, NOT NULL, RESTRICT | |
| tailorId | UUID | FK→TailorProfile, nullable, SET NULL | |
| serviceType | ENUM | NOT NULL | ALTERATION/CUSTOM_SEWING/EXPRESS |
| description | TEXT | nullable | |
| address | VARCHAR | NOT NULL | Ulice + číslo |
| city | VARCHAR | NOT NULL | |
| scheduledAt | TIMESTAMPTZ | NOT NULL | Plánovaný čas návštěvy |
| status | ENUM | NOT NULL, DEFAULT 'PENDING' | Stav zakázky |
| price | DECIMAL(10,2) | nullable | Přidělí admin |
| notes | TEXT | nullable | Interní poznámky |
| createdAt | TIMESTAMPTZ | NOT NULL | |
| updatedAt | TIMESTAMPTZ | NOT NULL | |

### 3.3 Databázové indexy

```sql
-- Hlavní dotazy na objednávky (filtrování dle zákazníka/krejčího)
CREATE INDEX idx_order_customer_id ON "Order"("customerId");
CREATE INDEX idx_order_tailor_id   ON "Order"("tailorId");
CREATE INDEX idx_order_status      ON "Order"("status");
CREATE INDEX idx_order_scheduled   ON "Order"("scheduledAt");

-- Vyhledávání krejčích (párování)
CREATE INDEX idx_tailor_locality   ON "TailorProfile"("locality");
CREATE INDEX idx_tailor_available  ON "TailorProfile"("isAvailable");

-- Přihlašování
CREATE UNIQUE INDEX idx_user_email ON "User"("email");
```

### 3.4 Kaskádová pravidla

| Akce | Efekt |
|------|-------|
| DELETE User (TAILOR) | CASCADE → smaže TailorProfile |
| DELETE TailorProfile | SET NULL → Order.tailorId = NULL |
| DELETE User (CUSTOMER) | RESTRICT — musí se nejdříve vyřešit objednávky |

### 3.5 Enumerace (Prisma Enums)

```prisma
enum Role {
  CUSTOMER
  TAILOR
  ADMIN
}

enum ServiceType {
  ALTERATION       // Úprava oděvu
  CUSTOM_SEWING    // Šití na míru
  EXPRESS          // Expresní služba
}

enum OrderStatus {
  PENDING          // Čeká na přiřazení krejčího
  CONFIRMED        // Přiřazen krejčí
  IN_PROGRESS      // Práce probíhá
  COMPLETED        // Dokončeno
  CANCELLED        // Zrušeno
}
```

---

## 4. Návrh API

### 4.1 Konvence

- Všechny endpointy vrací JSON
- Chybové odpovědi mají strukturu `{ "error": "zpráva", "details"?: {...} }`
- Úspěšné odpovědi vracejí data nebo `{ "message": "..." }`
- Autentizace: JWT v HTTP-only cookie (spravuje NextAuth)
- Vstupní validace: Zod schémata na straně serveru

### 4.2 Přehled endpointů

| Metoda | Cesta | Autentizace | Role | Popis |
|--------|-------|-------------|------|-------|
| POST | `/api/auth/register` | Ne | — | Registrace nového zákazníka |
| GET | `/api/auth/session` | Ne | — | Vrátí aktuální session (NextAuth) |
| POST | `/api/auth/signin` | Ne | — | Přihlášení (NextAuth) |
| POST | `/api/auth/signout` | Ano | Všechny | Odhlášení (NextAuth) |
| GET | `/api/orders` | Ano | Všechny | Seznam objednávek (dle role) |
| POST | `/api/orders` | Ano | CUSTOMER | Vytvoření objednávky |
| GET | `/api/orders/:id` | Ano | Vlastník/Admin | Detail objednávky |
| PUT | `/api/orders/:id` | Ano | TAILOR/ADMIN | Aktualizace stavu/ceny |
| DELETE | `/api/orders/:id` | Ano | CUSTOMER/ADMIN | Zrušení objednávky |

### 4.3 Specifikace endpointů

#### POST `/api/auth/register`

**Popis:** Vytvoření nového zákaznického účtu

**Request Body:**
```json
{
  "name": "Jana Nováková",
  "email": "jana@example.cz",
  "password": "MojeHeslo123"
}
```

**Validace (Zod):**
```typescript
{
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
}
```

**Response 201:**
```json
{ "message": "Registrace proběhla úspěšně" }
```

**Response 409:**
```json
{ "error": "Uživatel s tímto e-mailem již existuje" }
```

**Response 400:**
```json
{
  "error": "Neplatná data",
  "details": { "password": ["String must contain at least 8 character(s)"] }
}
```

---

#### GET `/api/orders`

**Popis:** Vrátí seznam objednávek filtrovaný dle role přihlášeného uživatele

**Response 200 (CUSTOMER):**
```json
[
  {
    "id": "uuid",
    "serviceType": "ALTERATION",
    "status": "PENDING",
    "address": "Václavské náměstí 1",
    "city": "Praha",
    "scheduledAt": "2026-05-10T10:00:00.000Z",
    "price": null,
    "tailor": null,
    "createdAt": "2026-04-25T08:00:00.000Z"
  }
]
```

**Response 401:**
```json
{ "error": "Nepřihlášen" }
```

---

#### POST `/api/orders`

**Popis:** Zákazník vytvoří novou objednávku

**Request Body:**
```json
{
  "serviceType": "ALTERATION",
  "description": "Zkrácení kalhot o 5 cm",
  "address": "Václavské náměstí 1",
  "city": "Praha",
  "scheduledAt": "2026-05-10T10:00:00.000Z"
}
```

**Validace (Zod):**
```typescript
{
  serviceType: z.enum(['ALTERATION', 'CUSTOM_SEWING', 'EXPRESS']),
  description: z.string().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  scheduledAt: z.string().datetime()
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "customerId": "uuid",
  "serviceType": "ALTERATION",
  "status": "PENDING",
  "address": "Václavské náměstí 1",
  "city": "Praha",
  "scheduledAt": "2026-05-10T10:00:00.000Z",
  "price": null,
  "tailorId": null,
  "createdAt": "2026-04-25T08:00:00.000Z"
}
```

---

#### PUT `/api/orders/:id`

**Popis:** Aktualizace stavu, přiřazeného krejčího nebo ceny objednávky

**Request Body (příklad — admin přidělí cenu):**
```json
{
  "price": 350.00,
  "notes": "Zákazník požaduje modrý zip"
}
```

**Request Body (příklad — krejčí změní stav):**
```json
{
  "status": "IN_PROGRESS"
}
```

**Validace (Zod):**
```typescript
{
  status: z.enum([...OrderStatus]).optional(),
  tailorId: z.string().uuid().optional(),
  price: z.number().min(0).optional(),
  notes: z.string().optional()
}
```

**Response 200:** Aktualizovaný záznam objednávky

---

### 4.4 Chybové kódy

| HTTP kód | Situace |
|----------|---------|
| 200 | Úspěch (GET, PUT, DELETE) |
| 201 | Vytvořeno (POST) |
| 400 | Neplatná vstupní data |
| 401 | Nepřihlášen |
| 403 | Přihlášen, ale nemá oprávnění |
| 404 | Záznam nenalezen |
| 409 | Konflikt (duplicitní e-mail) |
| 500 | Serverová chyba |

---

## 5. Návrh komponent frontend

### 5.1 Hierarchie komponent

```
RootLayout (layout.tsx)
├── Providers (SessionProvider)
│   ├── Header (Client Component)
│   │   └── Nav (navigační menu)
│   │
│   ├── Stránky (Server Components, pokud není 'use client')
│   │   ├── HomePage (page.tsx) [Client — hero slider]
│   │   │   ├── HeroSlider
│   │   │   ├── HowItWorks
│   │   │   ├── ServicesSection
│   │   │   └── StatsBar
│   │   │
│   │   ├── LoginPage [Client — form]
│   │   │   └── Input, Button (UI komponenty)
│   │   │
│   │   ├── RegisterPage [Client — form]
│   │   │   └── Input, Button
│   │   │
│   │   ├── DashboardPage [Server — čte session, data]
│   │   │   ├── OrderCard (opakující se)
│   │   │   └── Badge (stav objednávky)
│   │   │
│   │   └── NewOrderPage [Client — multi-step wizard]
│   │       ├── ServicePicker (krok 1)
│   │       ├── BookingCalendar (krok 2)
│   │       └── OrderSummary (krok 3)
│   │
│   └── Footer (Server Component)
```

### 5.2 Klíčové komponenty

#### `Header` (`src/components/layout/Header/Header.tsx`)

**Typ:** Client Component (`'use client'`)  
**Důvod:** Potřebuje `useSession()` pro podmíněné zobrazení navigace

**Stav:**
- `session` — z `useSession()` hook
- `isMenuOpen` — mobilní menu toggle

**Chování:**
- Nepřihlášen: Zobrazí „Přihlásit se" a „Registrovat"
- Přihlášen (CUSTOMER): Zobrazí „Moje objednávky", „Dashboard", „Odhlásit"
- Přihlášen (TAILOR): Zobrazí „Zakázky", „Dashboard", „Odhlásit"
- Přihlášen (ADMIN): Zobrazí „Administrace", „Odhlásit"

---

#### `DashboardPage` (`src/app/(customer)/dashboard/page.tsx`)

**Typ:** Server Component  
**Důvod:** Data se načítají na serveru, není potřeba client-side state

**Data loading:**
```typescript
const session = await getServerSession(authOptions);
const orders = await prisma.order.findMany({
  where: { customerId: session.user.id },
  include: { tailor: true },
  orderBy: { createdAt: 'desc' }
});
```

**Zobrazení dle role:**
- `CUSTOMER` — vlastní objednávky + statistiky (celkem, aktivní, dokončené)
- `TAILOR` — přiřazené zakázky seřazené dle `scheduledAt`
- `ADMIN` — všechny objednávky + odkaz na administraci

---

#### `OrderForm` (`src/components/features/OrderForm/`)

**Typ:** Client Component  
**Důvod:** Interaktivní formulář s lokálním stavem kroků

**Stav:**
```typescript
const [step, setStep] = useState<1 | 2 | 3>(1);
const [formData, setFormData] = useState<OrderFormData>({
  serviceType: null,
  description: '',
  address: '',
  city: '',
  scheduledAt: null
});
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Navigace kroků:**
- Krok 1 → 2: Musí být vybrán `serviceType`
- Krok 2 → 3: Musí být vyplněna adresa, město, datum
- Krok 3: Rekapitulace + odeslání

**Odeslání:**
```typescript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

---

#### UI komponenty (`src/components/ui/`)

| Komponenta | Props | Popis |
|-----------|-------|-------|
| `Button` | `variant`, `size`, `isLoading`, `disabled`, `onClick` | Primární akční prvek, support pro loading stav |
| `Input` | `label`, `error`, `type`, `placeholder`, `register` | Formulářové pole s error statem |
| `Card` | `children`, `className` | Obalující karta s shadow a border-radius |
| `Badge` | `status: OrderStatus` | Barevný štítek stavu objednávky |

---

### 5.3 Design systém

#### Barevná paleta

| Proměnná | Hodnota | Použití |
|---------|---------|---------|
| `--color-primary` | `#1a1a2e` | Hlavní barva, pozadí headeru, CTA text |
| `--color-accent` | `#c9a84c` | Zlatá — akcenty, hover stavy, důležité prvky |
| `--color-surface` | `#f8f6f1` | Krémová — pozadí stránek |
| `--color-text` | `#2d2d2d` | Hlavní text |
| `--color-text-muted` | `#7a7a7a` | Sekundární text, placeholdery |
| `--color-white` | `#ffffff` | Karty, pozadí formulářů |
| `--color-error` | `#e53e3e` | Chybové stavy |
| `--color-success` | `#38a169` | Úspěšné stavy |

#### Typografie

| Proměnná | Font | Použití |
|---------|------|---------|
| `--font-display` | Playfair Display (serif) | Nadpisy H1–H3, hero texty |
| `--font-body` | DM Sans (sans-serif) | Veškerý body text, UI prvky |

#### Breakpoints (SCSS mixiny)

```scss
@mixin mobile  { @media (max-width: 767px)  { @content; } }
@mixin tablet  { @media (max-width: 1023px) { @content; } }
@mixin desktop { @media (min-width: 1024px) { @content; } }
```

#### Stavy objednávky — barevné kódování (Badge)

| Stav | Barva | Pozadí |
|------|-------|--------|
| PENDING | `#7a7a7a` | `#f0f0f0` |
| CONFIRMED | `#2b6cb0` | `#ebf8ff` |
| IN_PROGRESS | `#c9a84c` | `#fffbeb` |
| COMPLETED | `#38a169` | `#f0fff4` |
| CANCELLED | `#e53e3e` | `#fff5f5` |

---

## 6. Bezpečnostní návrh

### 6.1 Autentizační tok

```
1. Uživatel odešle přihlašovací formulář
        │
        ▼
2. NextAuth CredentialsProvider
   - Lookup user by email (prisma.user.findUnique)
   - bcryptjs.compare(password, user.passwordHash)
   - Pokud shoda → vrátí user objekt
        │
        ▼
3. NextAuth JWT Callback
   token.id   = user.id
   token.role = user.role
        │
        ▼
4. NextAuth Session Callback
   session.user.id   = token.id
   session.user.role = token.role
        │
        ▼
5. JWT uložen v HTTP-only cookie
   - Secure: true (HTTPS only v produkci)
   - SameSite: Lax
   - HttpOnly: true (nedostupný pro JavaScript)
```

### 6.2 Autorizační kontroly

**Middleware** (`src/middleware.ts`):
```typescript
// Každý požadavek na /dashboard/*, /orders/*, /admin/*
// musí mít platný JWT token
export default withAuth(function middleware(req) {
  const token = req.nextauth.token;
  
  // Admin trasy vyžadují roli ADMIN
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
}, {
  callbacks: {
    authorized: ({ token }) => !!token
  }
});
```

**API úroveň** (v každém route handleru):
```typescript
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
}
// Dále kontrola vlastnictví záznamu (session.user.id === order.customerId)
```

### 6.3 Hashování hesel

```typescript
// Registrace
const passwordHash = await bcrypt.hash(password, 12);

// Přihlášení
const isValid = await bcrypt.compare(password, user.passwordHash);
```

Cost faktor 12 znamená ~250 ms na hašování na moderním hardware — dostatečné pro ochranu před brute force, přijatelné pro UX.

### 6.4 Validace vstupů

**Princip:** Nikdy nedůvěřuj klientovi. Každý API endpoint validuje vstupy nezávisle na klientské validaci.

```typescript
// Příklad — POST /api/orders
const body = await req.json();
const parsed = createOrderSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: 'Neplatná data', details: parsed.error.flatten() },
    { status: 400 }
  );
}
// parsed.data je nyní typově bezpečné
```

### 6.5 Ochrana citlivých dat

- Hesla nejsou nikdy vrácena v API odpovědích
- Interní poznámky (`notes`) nejsou viditelné zákazníkům
- `passwordHash` je vyloučen ze všech SELECT dotazů vracených přes API
- Databázové credentials pouze v `.env.local` (git-ignored)

---

## 7. Nasazení a konfigurace

### 7.1 Požadavky na prostředí

**Produkční server:**
- Node.js 18+
- 512 MB RAM (min.), doporučeno 1 GB+
- PostgreSQL 14+ (může být na separátním serveru)

**Build prerequisites:**
```bash
npm install          # Instalace závislostí
npx prisma generate  # Generování Prisma clienta
npx prisma migrate deploy  # Aplikace migrací (produkce)
npm run build        # Next.js produkční build
npm start            # Spuštění serveru
```

### 7.2 Proměnné prostředí

| Proměnná | Povinná | Příklad | Popis |
|----------|---------|---------|-------|
| `DATABASE_URL` | Ano | `postgresql://user:pass@localhost:5432/tailorent` | Connection string PostgreSQL |
| `NEXTAUTH_SECRET` | Ano | `openssl rand -base64 32` | Podpisový klíč JWT |
| `NEXTAUTH_URL` | Ano | `https://tailorent.cz` | Veřejná URL aplikace |

### 7.3 Inicializace databáze

```bash
# Vývojové prostředí — vytvoří/aktualizuje DB + naplní testovacími daty
npx prisma migrate dev
npx prisma db seed

# Produkční prostředí — pouze migrace (bez seed)
npx prisma migrate deploy
```

### 7.4 Konfigurace Next.js (`next.config.ts`)

```typescript
// Klíčové nastavení: SASS path aliases
sassOptions: {
  includePaths: ['./src/styles'],
  // Umožňuje @use 'variables'; bez relativní cesty
}
```

### 7.5 TypeScript konfigurace (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
    // @/components/... → src/components/...
  }
}
```

---

*Dokument popisuje aktuální implementovaný stav aplikace. Plánované funkce (platební brána, e-mailové notifikace, hodnocení) budou dokumentovány v příslušných verzích tohoto dokumentu při jejich implementaci.*
