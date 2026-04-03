

Konfigurace prostředí

```bash
cp .env.example .env.local
```

Vyplň hodnoty v `.env.local` — viz sekce [Proměnné prostředí](#proměnné-prostředí).

Databáze

```bash
# Vytvoření schématu
pnpm prisma migrate dev --name init

# Seed testovacích dat
pnpm prisma db seed
```

Spuštění

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

---

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


## Licence

MIT
