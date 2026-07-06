import webserver from "infra/webserver";
import activation from "models/activation";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  let createUserResponseBody;

  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registration.flow@email.com",
          password: "RegistrationFlowPassword",
        }),
      },
    );

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponse.status).toBe(201);
    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@email.com",
      features: ["read:activation_token"],
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@clone.tabnews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@email.com>");
    expect(lastEmail.subject).toEqual("Ative seu cadastro no Clone TabNews!");
    expect(lastEmail.text).toContain("RegistrationFlow");

    const activationToken = orchestrator.extractUUID(lastEmail.text)

    expect(lastEmail.text).toContain(`${webserver.origin}/cadastro/ativar/${activationToken}`)

    const activationTokenObject = await activation.findOneValidById(activationToken)

    expect(activationTokenObject.user_id).toBe(createUserResponseBody.id)
    expect(activationTokenObject.used_at).toBe(null)
  });

  test.todo("Active account");

  test.todo("Login");

  test.todo("Get user information");
});
