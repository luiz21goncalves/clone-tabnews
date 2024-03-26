import database from "infra/database";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

beforeAll(cleanDatabase);

test("POST /api/v1/migrations should return 200", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  const response1Body = await response1.json();

  expect(response1.status).toBe(201);
  expect(response1Body.length).toBeGreaterThan(0);
  expect(Array.isArray(response1Body)).toBe(true);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  const response2Body = await response2.json();

  expect(response2.status).toBe(200);
  expect(response2Body.length).toBe(0);
  expect(Array.isArray(response1Body)).toBe(true);
});
