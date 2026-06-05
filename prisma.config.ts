
import "dotenv/config";
import { defineConfig } from "prisma/config";

function assertDeployableDatabaseUrl(value: string, envName: string) {
  const url = new URL(value);
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);

  if (process.env.VERCEL === "1" && isLocalhost) {
    throw new Error(
      `${envName} points to ${url.hostname}. Vercel cannot reach a local database; set ${envName} to your Neon ${
        envName === "DATABASE_URL" ? "pooled" : "direct"
      } PostgreSQL connection string.`
    );
  }

  return url;
}

function getMigrationDatabaseUrl() {
  if (process.env.DIRECT_DATABASE_URL) {
    return assertDeployableDatabaseUrl(
      process.env.DIRECT_DATABASE_URL,
      "DIRECT_DATABASE_URL"
    ).toString();
  }

  if (!process.env.DATABASE_URL) {
    return "";
  }

  const url = assertDeployableDatabaseUrl(
    process.env.DATABASE_URL,
    "DATABASE_URL"
  );
  url.hostname = url.hostname.replace("-pooler.", ".");
  return url.toString();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx ts-node --project tsconfig.seed.json prisma/seed.ts",
  },
  datasource: {
    url: getMigrationDatabaseUrl(),
  },
});
