import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import session from "models/session";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  describe("Default user", () => {
    test("With nonexistente session", async () => {
      const nonExistentToken =
        "260ee969b5977125c47f445342a4971637be405a2e0d60a3ddde3a2cdc9c45fdef13939afff6a3fc83357e277763b1ed";

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${nonExistentToken}`,
        },
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        id: sessionObject.id,
        token: sessionObject.token,
        user_id: sessionObject.user_id,
        expires_at: body.expires_at,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.expires_at)).not.toBeNaN();
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();

      expect(body.expires_at < sessionObject.expires_at.toISOString()).toEqual(
        true,
      );
      expect(body.updated_at > sessionObject.updated_at.toISOString()).toEqual(
        true,
      );

      const parsedSetCookie = setCookieParser(response, { map: true });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        httpOnly: true,
        sameSite: "Strict",
        path: "/",
      });

      const doubleCheckResponse = await fetch(
        "http://localhost:3000/api/v1/user",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );
      const doubleCheckResponseBody = await doubleCheckResponse.json();

      expect(doubleCheckResponse.status).toBe(401);
      expect(doubleCheckResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });
  });
});
