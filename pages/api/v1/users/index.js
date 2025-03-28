import { createRouter } from "next-connect";

import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const { email, username, password } = request.body;

  const newUser = await user.create({ email, username, password });

  return response.status(201).json(newUser);
}
