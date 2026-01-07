# Utility Scripts

This directory contains helper scripts for development and deployment.

## copy-prisma-client.sh

Utility script to install a pre-generated Prisma client when `npx prisma generate` doesn't work due to network restrictions.

### When to use

Use this script if you're in an environment where Prisma binaries cannot be downloaded (403 Forbidden error).

### Steps

1. **On a machine with working Prisma access:**

```bash
cd prophet-trader-nextjs
npm install
npx prisma generate
tar -czf ~/prisma-client.tar.gz node_modules/.prisma node_modules/@prisma/client
```

2. **Transfer the archive:**

```bash
# Example with scp
scp ~/prisma-client.tar.gz user@target-machine:/tmp/

# Or use any file transfer method
```

3. **On the target machine:**

```bash
cd prophet-trader-nextjs
./scripts/copy-prisma-client.sh /tmp/prisma-client.tar.gz
```

### What it does

- Extracts the pre-generated Prisma client
- Places it in the correct `node_modules` directories
- Verifies the installation

### After installation

Once the client is installed, you can:

```bash
# Push database schema
npx prisma db push

# Start development server
npm run dev

# Open Prisma Studio
npx prisma studio
```

## Troubleshooting

### "Cannot find module '@prisma/client'"

Make sure you:
1. Ran the script from the `prophet-trader-nextjs` directory
2. The tar file was created from the same project structure
3. Node modules are installed: `npm install`

### "Prisma schema not found"

The script only installs the client, not the schema. Make sure:
1. Your `prisma/schema.prisma` exists
2. It matches the version used to generate the client

### Version mismatch

If you get version mismatch errors:
1. Check the Prisma version in `package.json`
2. Regenerate the client with matching version
3. Or update `package.json` to match the client version
