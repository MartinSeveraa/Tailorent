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
- npm
- PostgreSQL

### Instalace závislostí

```bash
npm install
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
npx prisma migrate dev --name init

# Seed demo dat (uživatelé, objednávky, služby)
npm run prisma:seed
```

### Spuštění

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).


## Užitečné příkazy

```bash
# Prisma Studio — GUI pro databázi
npm run prisma:studio

# Generování Prisma klienta po změně schématu
npm run prisma:generate

# Linting
npm run lint
```

---

## Licence

MIT
