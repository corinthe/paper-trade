# Prisma Database Setup

## Current Status

✅ **Configuration complète**
- `.env.local` créé avec les credentials Prisma
- `schema.prisma` configuré pour Prisma Accelerate + pgvector
- Build Next.js fonctionne (graceful handling en place)

❌ **Client Prisma non généré**
- Problème réseau avec `binaries.prisma.sh` (403 Forbidden)
- Empêche la génération du client Prisma
- Application peut build mais ne peut pas se connecter à la DB en runtime

## Configuration Database

### Variables d'environnement (`.env.local`)

```env
# Prisma Accelerate (pour production/connexion pooling)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGc..."

# Direct PostgreSQL URL (pour migrations)
DIRECT_URL="postgres://144be3a8d3743d8e5fb106ed060d2b9458037aa71e1e3b9950c93af4a0698249:sk_xZuS-YEL4idQKMfGCy9ec@db.prisma.io:5432/postgres?sslmode=require"
```

### Schema Prisma

Le schema utilise maintenant `directUrl` pour les migrations avec Prisma Accelerate :

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [vector]
}
```

## Étapes pour finaliser la configuration

### 1. Générer le client Prisma

Quand le problème réseau sera résolu :

```bash
npx prisma generate
```

Ou en cas de problème réseau persistant :

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### 2. Activer l'extension pgvector

Avant de pousser le schéma, activer l'extension dans votre base PostgreSQL :

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Ou via Prisma :

```bash
npx prisma db execute --file prisma/enable-pgvector.sql
```

Créez le fichier `prisma/enable-pgvector.sql` :

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Pousser le schéma à la base de données

```bash
npx prisma db push
```

Ou pour une migration complète :

```bash
npx prisma migrate dev --name init
```

### 4. Vérifier la connexion

```bash
npx prisma studio
```

Cela ouvrira une interface web pour explorer votre base de données.

## Problème actuel : 403 Forbidden

### Diagnostic

```
Error: Failed to fetch the engine file at
https://binaries.prisma.sh/all_commits/c2990dca591cba766e3b7ef5d9e8a84796e47ab7/debian-openssl-3.0.x/schema-engine.gz
- 403 Forbidden
```

### Causes possibles

1. **Restriction réseau/firewall** - Le serveur binaries.prisma.sh bloque les requêtes
2. **Rate limiting** - Trop de requêtes depuis cette IP
3. **Problème temporaire** - Le serveur Prisma peut être down

### Solutions

#### Option 1 : Attendre et réessayer

Le problème peut être temporaire :

```bash
# Réessayer dans quelques minutes/heures
npx prisma generate
```

#### Option 2 : Utiliser une connexion différente

Si possible, essayer depuis :
- Une connexion VPN différente
- Un réseau différent
- Une machine différente

#### Option 3 : Téléchargement manuel des binaires

1. Télécharger manuellement depuis : https://github.com/prisma/prisma-engines/releases
2. Placer dans `node_modules/@prisma/engines/`
3. Réexécuter `npx prisma generate`

#### Option 4 : Build avec Prisma pré-généré

Si vous avez accès à une machine où Prisma fonctionne :

```bash
# Sur la machine qui fonctionne
npx prisma generate
tar -czf prisma-client.tar.gz node_modules/.prisma node_modules/@prisma

# Transférer et extraire sur la machine de destination
tar -xzf prisma-client.tar.gz
```

## État du code

### Gestion gracieuse (déjà implémentée)

Le fichier `src/lib/db/client.ts` contient une gestion gracieuse :

```typescript
function createPrismaClient() {
  try {
    return new PrismaClient({ ... });
  } catch (error) {
    console.warn('PrismaClient not initialized...');
    return null as unknown as PrismaClient;
  }
}
```

Cela permet :
- ✅ Le build Next.js fonctionne
- ✅ Compilation TypeScript réussie
- ❌ Runtime échouera si on essaie d'utiliser la DB

### Routes affectées

Toutes les routes suivantes nécessitent le client Prisma généré pour fonctionner :

**Position Management (Phase 3)**
- `/api/positions/managed` - Create/list managed positions
- `/api/positions/managed/[id]` - Get/close position
- `/api/positions/monitor` - Monitor positions

**Trading (Phase 1)**
- Routes qui persistent les ordres en DB

**Intelligence (Phase 2)**
- Routes qui stockent les analyses

## Workaround temporaire

En attendant que Prisma fonctionne, vous pouvez :

1. **Tester sans persistence**
   - Les services Alpaca et Claude fonctionnent
   - Seule la persistence en DB est désactivée

2. **Mocker la DB pour les tests**
   - Les tests unitaires mockent déjà Prisma
   - Continuer le développement avec les mocks

3. **Utiliser une autre DB temporairement**
   - SQLite local (modifier le schema)
   - PostgreSQL local sans pgvector

## Prochaines étapes quand Prisma fonctionne

1. ✅ Générer le client : `npx prisma generate`
2. ✅ Activer pgvector : `CREATE EXTENSION vector;`
3. ✅ Pousser le schéma : `npx prisma db push`
4. ✅ Tester la connexion : `npx prisma studio`
5. ✅ Déployer l'application

## Ressources

- **Prisma Documentation** : https://www.prisma.io/docs
- **Prisma Accelerate** : https://www.prisma.io/docs/accelerate
- **pgvector** : https://github.com/pgvector/pgvector
- **Troubleshooting** : https://www.prisma.io/docs/orm/more/help-and-troubleshooting

## Support

Si le problème persiste :
- Vérifier les logs du serveur Prisma
- Contacter le support Prisma
- Essayer une version différente de Prisma CLI
