import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({ password: "senha-correta" });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.incorreto@gmail.com",
          password: "senha-correta",
        }),
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        action: "Verifique se os dados enviados estão corretos.",
        message: "Dados de autenticação não conferem.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With correct `email` but incorrect `password`", async () => {
      await orchestrator.createUser({ email: "email.correto@gmail.com" });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correto@gmail.com",
          password: "senha-incorreta",
        }),
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        action: "Verifique se os dados enviados estão corretos.",
        message: "Dados de autenticação não conferem.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With incorrect `email` and incorrect `password`", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.incorreto@gmail.com",
          password: "senha-incorreta",
        }),
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        action: "Verifique se os dados enviados estão corretos.",
        message: "Dados de autenticação não conferem.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });
  });
});
