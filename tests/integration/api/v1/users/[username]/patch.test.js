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
      const responseWithValidUser1 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user1",
            email: "user1@gmail.com",
            password: "senha123",
          }),
        },
      );
      expect(responseWithValidUser1.status).toBe(201);

      const responseWithValidUser2 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user2",
            email: "user2@gmail.com",
            password: "senha123",
          }),
        },
      );
      expect(responseWithValidUser2.status).toBe(201);

      const responseWithInvalidUpdate = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user1",
          }),
        },
      );
      const bodyWithInvalidUpdate = await responseWithInvalidUpdate.json();

      expect(responseWithInvalidUpdate.status).toBe(400);
      expect(bodyWithInvalidUpdate).toEqual({
        status_code: 400,
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        name: "ValidationError",
      });
    });

    test("With duplicated 'email'", async () => {
      const responseWithValidUser1 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "email1",
            email: "email1@gmail.com",
            password: "senha123",
          }),
        },
      );
      expect(responseWithValidUser1.status).toBe(201);

      const responseWithValidUser2 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "email2",
            email: "email2@gmail.com",
            password: "senha123",
          }),
        },
      );
      expect(responseWithValidUser2.status).toBe(201);

      const responseWithInvalidUpdate = await fetch(
        "http://localhost:3000/api/v1/users/email2",
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
      const bodyWithInvalidUpdate = await responseWithInvalidUpdate.json();

      expect(responseWithInvalidUpdate.status).toBe(400);
      expect(bodyWithInvalidUpdate).toEqual({
        status_code: 400,
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        name: "ValidationError",
      });
    });

    test("With case mismatch for 'username'", async () => {
      const responseWithValidUser1 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "mismatchCase",
            email: "mismatchCase@gmail.com",
            password: "senha123",
          }),
        },
      );
      expect(responseWithValidUser1.status).toBe(201);

      const responseWithValidUpdate = await fetch(
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
      const bodyWithValidUpdate = await responseWithValidUpdate.json();

      expect(responseWithValidUpdate.status).toBe(200);
      expect(bodyWithValidUpdate).toEqual(bodyWithValidUpdate);
    });

    test("With unique 'username'", async () => {
      const responseWithValidUser = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUsername",
            email: "uniqueUsername@gmail.com",
            password: "senha123",
          }),
        },
      );
      expect(responseWithValidUser.status).toBe(201);

      const responseWithValidUpdate = await fetch(
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
      const bodyWithValidUpdate = await responseWithValidUpdate.json();

      expect(responseWithValidUpdate.status).toBe(200);
      expect(bodyWithValidUpdate).toEqual({
        id: expect.any(String),
        username: "updatedUniqueUser",
        email: "uniqueUsername@gmail.com",
        password: bodyWithValidUpdate.password,
        created_at: bodyWithValidUpdate.created_at,
        updated_at: bodyWithValidUpdate.updated_at,
      });
      expect(uuidVersion(bodyWithValidUpdate.id)).toBe(4);
      expect(Date.parse(bodyWithValidUpdate.created_at)).not.toBeNaN();
      expect(Date.parse(bodyWithValidUpdate.updated_at)).not.toBeNaN();
      expect(
        bodyWithValidUpdate.updated_at > bodyWithValidUpdate.created_at,
      ).toBe(true);
    });

    test("With unique 'email'", async () => {
      const responseWithValidUser = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueEmail",
            email: "uniqueEmail@gmail.com",
            password: "senha123",
          }),
        },
      );
      expect(responseWithValidUser.status).toBe(201);

      const responseWithValidUpdate = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail",
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
      const bodyWithValidUpdate = await responseWithValidUpdate.json();

      expect(responseWithValidUpdate.status).toBe(200);
      expect(bodyWithValidUpdate).toEqual({
        id: expect.any(String),
        username: "uniqueEmail",
        email: "updatedUniqueEmail@gmail.com",
        password: bodyWithValidUpdate.password,
        created_at: bodyWithValidUpdate.created_at,
        updated_at: bodyWithValidUpdate.updated_at,
      });
      expect(uuidVersion(bodyWithValidUpdate.id)).toBe(4);
      expect(Date.parse(bodyWithValidUpdate.created_at)).not.toBeNaN();
      expect(Date.parse(bodyWithValidUpdate.updated_at)).not.toBeNaN();
      expect(
        bodyWithValidUpdate.updated_at > bodyWithValidUpdate.created_at,
      ).toBe(true);
    });
    test("With new 'password'", async () => {
      const responseWithValidUser = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "newPassword",
            email: "newPassword@gmail.com",
            password: "senha123",
          }),
        },
      );
      expect(responseWithValidUser.status).toBe(201);

      const responseWithValidUpdate = await fetch(
        "http://localhost:3000/api/v1/users/newPassword",
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
      const bodyWithValidUpdate = await responseWithValidUpdate.json();

      expect(responseWithValidUpdate.status).toBe(200);
      expect(bodyWithValidUpdate).toEqual({
        id: expect.any(String),
        username: "newPassword",
        email: "newPassword@gmail.com",
        password: bodyWithValidUpdate.password,
        created_at: bodyWithValidUpdate.created_at,
        updated_at: bodyWithValidUpdate.updated_at,
      });
      expect(uuidVersion(bodyWithValidUpdate.id)).toBe(4);
      expect(Date.parse(bodyWithValidUpdate.created_at)).not.toBeNaN();
      expect(Date.parse(bodyWithValidUpdate.updated_at)).not.toBeNaN();
      expect(
        bodyWithValidUpdate.updated_at > bodyWithValidUpdate.created_at,
      ).toBe(true);

      const userInDatabase = await user.findOneByUsername("newPassword");
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
