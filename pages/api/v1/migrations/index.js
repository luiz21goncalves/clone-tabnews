import path from "node:path";
import migrationRunner from "node-pg-migrate";

export default async function handle(request, response) {
  const migrations = await migrationRunner({
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: path.join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });

  return response.status(200).json(migrations);
}
