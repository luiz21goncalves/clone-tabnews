import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Clone TabNews <contato@clone.tabnews.com.br>",
      to: "contato@curso.dev",
      subject: "Test de Assunto",
      text: "Test de corpo.",
    });
    await email.send({
      from: "Clone TabNews <contato@clone.tabnews.com.br>",
      to: "contato@curso.dev",
      subject: "Último email enviado",
      text: "Corpo do último email.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toEqual("<contato@clone.tabnews.com.br>");
    expect(lastEmail.recipients[0]).toEqual("<contato@curso.dev>");
    expect(lastEmail.subject).toEqual("Último email enviado");
    expect(lastEmail.text).toEqual("Corpo do último email.\r\n");
  });
});
