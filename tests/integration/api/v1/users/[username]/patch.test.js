import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
        },
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

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({ username: "user1" });

      await orchestrator.createUser({ username: "user2" });

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({
        status_code: 400,
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        name: "ValidationError",
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({ email: "email1@gmail.com" });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@gmail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({
        status_code: 400,
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        name: "ValidationError",
      });
    });

    test("With case mismatch for 'username'", async () => {
      await orchestrator.createUser({ username: "mismatchCase" });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/mismatchCase",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "MismatchCase",
          }),
        },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(body);
    });

    test("With unique 'username'", async () => {
      await orchestrator.createUser({ username: "uniqueUsername" });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUsername",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "updatedUniqueUser",
          }),
        },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        id: expect.any(String),
        username: "updatedUniqueUser",
        email: body.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueEmail@gmail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "updatedUniqueEmail@gmail.com",
          }),
        },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        id: expect.any(String),
        username: body.username,
        email: "updatedUniqueEmail@gmail.com",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createUser = await orchestrator.createUser({
        password: "senha123",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "updatedPassword",
          }),
        },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        id: expect.any(String),
        username: body.username,
        email: body.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createUser.username);
      const incorrectPasswordHash = await password.compare(
        "senha123",
        userInDatabase.password,
      );
      const correctPasswordHash = await password.compare(
        "updatedPassword",
        userInDatabase.password,
      );

      expect(correctPasswordHash).toBe(true);
      expect(incorrectPasswordHash).toBe(false);
    });
  });
});
