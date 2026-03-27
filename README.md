# ✂️ Krejčí App

Prémiová webová aplikace pro objednávání krejčovských služeb přímo k zákazníkovi domů.

## Tech Stack

| Vrstva | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router) |
| Jazyk | TypeScript |
| Styling | SCSS Modules |
| Databáze | PostgreSQL |
| ORM | Prisma |
| Autentizace | NextAuth.js (email + heslo) |
| Runtime | Node.js 20+ |

## Rychlý start

### 1. Požadavky

- Node.js 20+
- PostgreSQL 15+
- pnpm (doporučeno) nebo npm

### 2. Instalace

```bash
git clone https://github.com/your-username/krejci-app.git
cd krejci-app
pnpm install
```

### 3. Konfigurace prostředí

```bash
cp .env.example .env.local
```

Vyplň hodnoty v `.env.local` — viz sekce [Proměnné prostředí](#proměnné-prostředí).

### 4. Databáze

```bash
# Vytvoření schématu
pnpm prisma migrate dev --name init

# Seed testovacích dat
pnpm prisma db seed
```

### 5. Spuštění

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

---

## Proměnné prostředí

| Proměnná | Popis | Příklad |
|----------|-------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/krejci` |
| `NEXTAUTH_SECRET` | Secret pro podepisování session | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Veřejná URL aplikace | `http://localhost:3000` |

---

## Struktura projektu

```
krejci-app/
├── prisma/                    # Prisma schéma a migrace
├── public/                    # Statické soubory
└── src/
    ├── app/                   # Next.js App Router (stránky + API)
    │   ├── (auth)/            # Login, registrace
    │   ├── (customer)/        # Zákaznická sekce
    │   ├── (admin)/           # Admin rozhraní
    │   └── api/               # API routes
    ├── components/
    │   ├── ui/                # Základní UI prvky (Button, Input...)
    │   ├── layout/            # Header, Footer, Nav
    │   └── features/          # Byznys komponenty (OrderForm, TailorCard...)
    ├── lib/                   # Sdílené utility (prisma, auth, helpers)
    ├── styles/                # Globální SCSS, proměnné, mixiny
    └── types/                 # TypeScript typy
```

Detailní popis viz [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Role uživatelů

| Role | Popis |
|------|-------|
| `CUSTOMER` | Zákazník — vytváří objednávky |
| `TAILOR` | Krejčí — přijímá a spravuje zakázky |
| `ADMIN` | Administrátor — správa celého systému |

---

## Vývoj

### Prisma Studio (GUI pro DB)

```bash
pnpm prisma studio
```

### Generování Prisma klienta po změně schématu

```bash
pnpm prisma generate
```

### Linting

```bash
pnpm lint
```

---

## Roadmap

- [x] Struktura projektu
- [x] DB schéma (Prisma)
- [x] Autentizace (NextAuth)
- [ ] Landing page
- [ ] Objednávkový formulář
- [ ] Matching systém krejčích
- [ ] Zákaznický dashboard
- [ ] Admin rozhraní
- [ ] E-mailové notifikace

---

## Licence

MIT
