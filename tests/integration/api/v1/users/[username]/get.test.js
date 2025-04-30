import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With expect case match", async () => {
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "MesmoCase",
            email: "mesmo.case@gmail.com",
            password: "senha123",
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);

      const getUserResponse = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );
      const getUserBody = await getUserResponse.json();

      expect(getUserResponse.status).toBe(200);
      expect(getUserBody).toEqual({
        id: expect.any(String),
        username: "MesmoCase",
        email: "mesmo.case@gmail.com",
        password: getUserBody.password,
        created_at: getUserBody.created_at,
        updated_at: getUserBody.updated_at,
      });
      expect(uuidVersion(getUserBody.id)).toBe(4);
      expect(Date.parse(getUserBody.created_at)).not.toBeNaN();
      expect(Date.parse(getUserBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "CaseDiferente",
            email: "case.diferente@gmail.com",
            password: "senha123",
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);

      const getUserResponse = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );
      const getUserBody = await getUserResponse.json();

      expect(getUserResponse.status).toBe(200);
      expect(getUserBody).toEqual({
        id: expect.any(String),
        username: "CaseDiferente",
        email: "case.diferente@gmail.com",
        password: getUserBody.password,
        created_at: getUserBody.created_at,
        updated_at: getUserBody.updated_at,
      });
      expect(uuidVersion(getUserBody.id)).toBe(4);
      expect(Date.parse(getUserBody.created_at)).not.toBeNaN();
      expect(Date.parse(getUserBody.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado pelo sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
