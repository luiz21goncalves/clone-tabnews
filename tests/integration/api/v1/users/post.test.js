import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "luiz21goncalves",
          email: "luizhbgoncalves@gmail.com",
          password: "senha123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual({
        id: expect.any(String),
        username: "luiz21goncalves",
        email: "luizhbgoncalves@gmail.com",
        password: "senha123",
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With duplicated 'email'", async () => {
      const responseWithValidUser = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "email_duplicado_1",
            email: "duplicado@gmail.com",
            password: "senha123",
          }),
        },
      );

      expect(responseWithValidUser.status).toBe(201);

      const responseWithInvalidUser = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "email_duplicado_2",
            email: "Duplicado@gmail.com",
            password: "senha123",
          }),
        },
      );
      const bodyWithInvalidUser = await responseWithInvalidUser.json();

      expect(responseWithInvalidUser.status).toBe(400);
      expect(bodyWithInvalidUser).toEqual({
        status_code: 400,
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
        name: "ValidationError",
      });
    });

    test("With duplicated 'username'", async () => {
      const responseWithValidUser = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "username_duplicado",
            email: "username_duplicado_1@gmail.com",
            password: "senha123",
          }),
        },
      );

      expect(responseWithValidUser.status).toBe(201);

      const responseWithInvalidUser = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "Username_Duplicado",
            email: "username_duplicado_2@gmail.com",
            password: "senha123",
          }),
        },
      );
      const bodyWithInvalidUser = await responseWithInvalidUser.json();

      expect(responseWithInvalidUser.status).toBe(400);
      expect(bodyWithInvalidUser).toEqual({
        status_code: 400,
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
        name: "ValidationError",
      });
    });
  });
});
