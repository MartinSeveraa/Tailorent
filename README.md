# Tailorent

Platforma pro objednávání krejčovských služeb s návštěvou u zákazníka doma. Zákazníci si objednají krejčího online, krejčí přijede na zadanou adresu.

## Stack

- **Next.js 16** (App Router, server + client components)
- **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **NextAuth.js v4** (JWT, credentials provider)
- **SCSS Modules**
- **Zod** (validace)

## Role

| Role | Popis |
|---|---|
| `CUSTOMER` | Objednává krejčovské služby, sleduje stav objednávek |
| `TAILOR` | Přijímá a zpracovává zakázky |
| `ADMIN` | Spravuje objednávky, krejčí a katalog služeb |

---

## Lokální spuštění

### Požadavky

- Node.js 18+
- pnpm
- PostgreSQL

### Instalace závislostí

```bash
pnpm install
```

### Konfigurace prostředí

```bash
cp .env.example .env.local
```

Vyplň hodnoty v `.env.local`:

| Proměnná | Popis |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `NEXTAUTH_SECRET` | Náhodný secret — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL aplikace (lokálně `http://localhost:3000`) |

### Databáze

```bash
# Vytvoření schématu
pnpm prisma migrate dev --name init

# Seed demo dat (uživatelé, objednávky, služby)
pnpm prisma db seed
```

### Spuštění

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

---

## Demo účty (po seedu)

| Role | E-mail | Heslo |
|---|---|---|
| Admin | `admin@tailorent.cz` | `admin123` |
| Krejčí | `jana.novakova@tailorent.cz` | `krejci123` |
| Zákazník | `petr.svoboda@example.cz` | `zakaznik123` |

---

## Užitečné příkazy

```bash
# Prisma Studio — GUI pro databázi
pnpm prisma studio

# Generování Prisma klienta po změně schématu
pnpm prisma generate

# Linting
pnpm lint
```

---

## Licence

MIT
