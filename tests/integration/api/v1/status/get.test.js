import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      const responseBody = await response.json();

      expect(response.status).toEqual(200);

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

      expect(responseBody).toEqual({
        updated_at: parsedUpdatedAt,
        dependencies: {
          database: {
            version: "16.0",
            max_connections: 100,
            opened_connections: 1,
          },
        },
      });
    });
  });
});
