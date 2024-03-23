import database from "infra/database";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

beforeAll(cleanDatabase);

test("POST /api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  const responseBody = await response.json();
  const responseMigrationsNames = responseBody.map(
    (migration) => migration.name
  );

  const migrationsResult = await database.query("SELECT * FROM pgmigrations");
  const migrations = migrationsResult.rows;
  const migrationsNames = migrations.map((migration) => migration.name);

  expect(response.status).toBe(200);
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBe(migrations.length);
  expect(responseMigrationsNames).toStrictEqual(migrationsNames);
});
