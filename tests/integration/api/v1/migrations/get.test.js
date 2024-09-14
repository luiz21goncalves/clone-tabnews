import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Retrieving pending migrations", () => {
      test("For the first time", async () => {
        const response = await fetch("http://localhost:3000/api/v1/migrations");
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });

      test("For the second time", async () => {
        const response = await fetch("http://localhost:3000/api/v1/migrations");
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });
    });
  });
});
